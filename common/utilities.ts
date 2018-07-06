import * as fs from 'fs'
import * as path from 'path'

export class Utilities {

    public static fileExists (filePath: string): Boolean {

        try {
            fs.statSync(filePath)
        }
        catch (err) {
            if (err.code === 'ENOENT') return false
        }
        return true

    }

    public static preconditionCheck(): Boolean {
        
        let allGood = true
        if (!Utilities.fileExists(path.join(process.cwd(), '.env'))) {
            console.error(`Missing critical file .env: Create a local .env file 
                as a copy from cfg.env at root of the project. Cannot continue...`)
            allGood = false
        }
        
        const env = require("dotenv").config()
        
        console.log(JSON.stringify(Utilities.environmentVariables([],[]), null, 2))
        
        // TODO: Ensure env variable values exist

        return allGood
        
    }

    public static environmentVariables(obfuscate: Array<string>, remove: Array<string>): any {

        const env = process.env
        const result = {}
        Object.keys(env).forEach(key => {
            if (!key.startsWith('npm_') && obfuscate.indexOf(key) < 0 && remove.indexOf(key) < 0) {
                result[key] = env[key]
            }
        })
        if (obfuscate) {
            obfuscate.forEach((item) => {
                result[item + 'EXISTS'] = !!env[item]
            })
        }
        return result

    }

}