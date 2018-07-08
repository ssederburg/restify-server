import * as path from 'path'
import * as config from 'config'

import { Utilities, ErrorHandler } from '../common'

export class SwaggerService {

    private _fileContents: string = ''
    constructor (private server, private errorHandler: ErrorHandler) {

        const swaggerFilePath = path.join(process.cwd(), 'swagger.json')
        if (Utilities.fileExists(swaggerFilePath)) {
            this._fileContents = require(swaggerFilePath)
        }

    }

    public get(): Promise<string> {

        if (this._fileContents && config.serveSwagger) {
            return Promise.resolve(this._fileContents)
        } else {
            return Promise.resolve('')
        }

    }
}

