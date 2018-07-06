/*
    Local Builder is used to ensure _build or _bundle directory is properly configured
    This script is run each time npm run build or npm run buildw is executed
    This is also the script that runs on npm start in this directory
    We do NOT use spawn in the 'application' built using this process
*/
import * as fs from 'fs'
import * as path from 'path'
import * as spawn from 'cross-spawn'

class LocalBuilder {
    private _cwd: string
    private _targetDir: string
    private _packageJson = null // Set in method preConditions
    private _localBuilderConfig = null  // Set in method preConditions

    public build () {
        this._cwd = process.cwd()
        console.log(`Beginning Local Builder process in ${this._cwd}`)

        this._targetDir = path.join(this._cwd, '_build')
        console.log(`Target directory set to ${this._targetDir}`)

        if (!this.preConditions(this._cwd)) {
            console.error(`Preconditions were not met. Unable to continue process...`)
            return
        }
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
            console.error(`Cannot locate precondition: ${packageJsonPath}`)
            allGood = false
        }
        if (!this.fileExists(builderJsonPath)) {
            console.error(`Cannot locate precondition: ${builderJsonPath}`)
            allGood = false
        }

        if (allGood) {
            // Load Preconditional Variables
            this._packageJson = require(packageJsonPath)
            this._localBuilderConfig = require(builderJsonPath)

            // Verify Required Fields exist in Local Builder Config
            if (!this._localBuilderConfig.package) {
                console.error(`Local Builder Configuration missing key field: package`)
                allGood = false
            }
            if (!this._localBuilderConfig.package.dependencies) {
                console.error(`Local Builder Configuration missing key field: package.dependencies`)
                allGood = false
            }
        }
        return allGood
    }



}

const lb = new LocalBuilder()
lb.build()
