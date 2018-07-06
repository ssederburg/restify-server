import * as path from 'path'
import * as config from 'config'

import { Utilities } from '../common'

export class SwaggerService {

    private _fileContents: string
    public constructor (private server) {
        const swaggerFilePath = path.join(process.cwd(), 'swagger.json')
        if (Utilities.fileExists(swaggerFilePath)) {
            this._fileContents = require(swaggerFilePath)
        }
    }

    public init() {
        if (this._fileContents && config.serveSwagger) {
            this.server.get('/swagger.io', (req, res, next) => {
                try {
                    res.contentType = 'application/json'
                    res.header('Content-Type', 'application/json')
                    res.send(200, this._fileContents)
                }
                catch (err) {
                    console.error(`SwaggerService.init.error: ${err}`)
                    res.send(500, err)
                }
            })
        }
    }
}

