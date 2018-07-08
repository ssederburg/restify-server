/*
    Local Builder is used to ensure _build or _bundle directory is properly configured
    This script is run each time npm run build or npm run build is executed
    
    npm start ->    Regular ts-node process start in root directory. Uses root package.json
                    npm start does NOT execute this script at all.
    npm run build, npm run build -dev ->    executes this script. Creates _build directory using
                                            settings from localbuilder.config.json. Will include
                                            unit tests (mocha and chai)
    npm run build -prod ->  executes this script. Creates _bundle directory using settings from
                            localbuilder.config.json. Will not include tests, .gitignore
    
*/
import * as fs from 'fs-extra'
import * as path from 'path'
import * as spawn from 'cross-spawn'
const chalk = require('chalk')
const glob = require('glob')
const _ = require('lodash')

const info = chalk.blue
const loud = chalk.bold.blue
const error = chalk.bold.red
const warning = chalk.yellow

class LocalBuilder {
    private _cwd: string
    private _args: Array<string>
    private _targetDir: string
    private _isProd: boolean = false;
    private _packageJson = null // Set in method preConditions
    private _activeConfig = null // Set in method preConditions

    public build (args: any) {
        this._args = args
        this._cwd = process.cwd()
        console.log(info(`Beginning Local Builder process in ${this._cwd}`))
        console.log(info(`Args are ${this._args}`))
        
        this._isProd = (this._args.indexOf('-prod') >= 0) ? true : false
        this._targetDir = path.join(this._cwd, (this._isProd) ? '_bundle': '_build')
        console.log(info(`Target directory set to ${this._targetDir}`))

        if (!this.preConditions(this._cwd)) {
            console.error(error(`Preconditions were not met. Unable to continue process...`))
            this.shutdown()
            return
        }

        const endpoint = path.join(this._targetDir)
        this.verifyTargetDirectory(endpoint)

        this.copyCoreFiles(this._cwd, this._targetDir)

        // assets from localbuilder.config.json GLOB
        this.copyAssets(this._cwd, this._targetDir)

        // remove any exclusions from target
        this.removeExclusions(this._cwd, this._targetDir)

        // run tsc and build javascript files
        this.runTSC(this._cwd).then(() => {
            this.removeExclusions(this._cwd, this._targetDir)
            this.shutdown()
        })
    }
    
    private fileExists(filePath: string): boolean {

        try {
            fs.statSync(filePath)
        }
        catch(err) {
            if(err.code == 'ENOENT') return false
        }
        return true
    
    }

    private preConditions (cwd: string):Boolean {
        // require('./localbuilder.config.json') || null;
        // package.json
        // localbuilder.config.json
        const packageJsonPath = path.join(cwd, 'package.json')
        const builderJsonPath = path.join(cwd, 'localbuilder.config.json')
        let allGood = true

        if (!this.fileExists(packageJsonPath)) {
            console.error(error(`Cannot locate precondition: ${packageJsonPath}`))
            allGood = false
        }
        if (!this.fileExists(builderJsonPath)) {
            console.error(error(`Cannot locate precondition: ${builderJsonPath}`))
            allGood = false
        }

        if (allGood) {
            // Load Preconditional Variables
            this._packageJson = require(packageJsonPath)
            const localBuilderConfig = require(builderJsonPath)

            // Load Active Configuration
            this._activeConfig = {}
            if (localBuilderConfig.any) {
                console.log(info(`Active Config set to any`))
                this._activeConfig = localBuilderConfig.any
            }
            if (this._isProd && localBuilderConfig.prod) {
                console.log(info(`Active config merged with prod config`))
                this._activeConfig = _.merge({}, this._activeConfig, localBuilderConfig.prod)
                if (!this._activeConfig.preserveDevDependencies) {
                    if (this._activeConfig.package.devDependencies) {
                        delete this._activeConfig.package.devDependencies
                    }
                    if (this._activeConfig.package.nodemonConfig) {
                        delete this._activeConfig.package.nodemonConfig
                    }
                    if (this._activeConfig.package.scripts && this._activeConfig.package.scripts.test) {
                        delete this._activeConfig.package.scripts.test
                    }
                }
            }
            if (!this._isProd && localBuilderConfig.dev) {
                console.log(info(`Active config merged with dev config`))
                this._activeConfig = _.merge({}, this._activeConfig, localBuilderConfig.dev)
            }
            console.log(`Active Config`)
            console.log(JSON.stringify(this._activeConfig, null, 2))
            // Verify Required Fields exist in Local Builder Config
            if (!this.isValidConfig(this._activeConfig)) {
                console.log(error(`Invalid Active Configuration. Missing critical fields [package, dependencies, scripts, main]`))
                allGood = false
            }
        }
        return allGood
    }

    private isValidConfig(configContents: any): Boolean {
        if (!configContents.package) {
            return false
        }
        const element = Object.assign({}, configContents.package)

        if (!element.dependencies 
            || !element.scripts 
            || !element.main) {
            return false
        }
        return true
    }

    private verifyTargetDirectory(endpoint: string) {

        if (!fs.existsSync(endpoint)) {
            console.log(warning(`Creating Directory at: ${endpoint}`))
            fs.mkdirSync(endpoint)
        }

    }

    private copyCoreFiles(source, target) {
        
        // Configuration Files
        const sourceConfigFilePath = path.join(source, 'config', (this._isProd) ? 'production.json': 'default.json')
        const targetConfigFilePath = path.join(target, 'config', 'default.json')
        // Make sure config directory exists in target
        if (!fs.existsSync(path.join(target, 'config'))) {
            console.log(info('Creating target config directory'))
            fs.mkdirSync(path.join(target, 'config'))
        }
        // Copy config file to target
        console.log(warning(`Copying ${(this._isProd)?'PRODUCTION':'DEV'} JSON file to target from ${sourceConfigFilePath}`))
        fs.copyFileSync(sourceConfigFilePath, targetConfigFilePath)

        // .gitignore
        console.log(warning(`Copying .gitignore file from source to target`))
        fs.copyFileSync(path.join(source, '.gitignore'), path.join(target, '.gitignore'))

        // env file
        console.log(warning(`Copying .env file from source to target`))
        fs.copyFileSync(path.join(source, '.env'), path.join(target, '.env'))

        // swagger file
        console.log(warning(`Copying swagger.json file from source to target`))
        fs.copyFileSync(path.join(source, 'swagger.json'), path.join(target, 'swagger.json'))

        // package.json
        console.log(info(`Writing package.json to target`))
        fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify(this._activeConfig.package, null, 2))

    }

    private copyAssets(source, target) {

        const assets = this._activeConfig.assets
        if (!assets) return

        assets.forEach((asset) => {
            const matches = glob.sync(path.join(source, asset), {})
            if (matches) {
                matches.forEach((path) => {
                    const stat = fs.lstatSync(path)
                    const targetPath = path.replace(source, target)
                    if (stat.isDirectory()) {
                        this.verifyTargetDirectory(targetPath)
                    }
                    if (stat.isFile()) {
                        console.log(warning(`Copying file to: ${targetPath}`))
                        fs.copyFileSync(path, targetPath)
                    }
                })
            }
        })

    }

    private removeExclusions(source, target) {

        const exclusions = this._activeConfig.exclude
        if (!exclusions) return

        exclusions.forEach((asset) => {
            const matches = glob.sync(path.join(target, asset), {})
            if (matches) {
                matches.forEach((path) => {
                    const stat = fs.lstatSync(path)
                    if (stat.isDirectory()) {
                        console.log(warning(`Remove Directory: ${path}`))
                        fs.removeSync(path)
                    }
                    if (stat.isFile()) {
                        console.log(warning(`Remove file: ${path}`))
                        fs.removeSync(path)
                    }
                })
            }
        })

    }

    private runTSC(cwd): Promise<number> {

        const result = new Promise<number>((resolve, reject) => {

            const args = [
                '-outDir',
                this._targetDir,
                '-p',
                path.join(__dirname, 'tsconfig.json')
            ]

            console.log(info(`Executing TypeScript compilation step. Files created in target directory`))
            console.log(info(`Using settings from tsconfig.json file @${path.join(__dirname, 'tsconfig.json')}`))
            const ls = spawn('tsc', args, { cwd: path.join(cwd)})

            ls.stdout.on('data', (data) => {
                console.log(info(data))
            })

            ls.stderr.on('data', (data) => {
                console.error(error(data))
            })

            ls.on('close', (code) => {
                console.log(warning(`TSC process exited with code ${code}`))
                return resolve(code)
            })

        })

        return result;

    }

    private shutdown() {
        console.log(info('Process completed successfully...'))
        process.exit(0)
    }

}

const lb = new LocalBuilder()
lb.build(process.argv)
