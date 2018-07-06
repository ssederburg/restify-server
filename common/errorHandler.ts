import * as config from 'config'

export class ErrorHandler {

    public static defaultMessage = {
        message: 'Error',
        code: -1
    }
    constructor (private server) {}

    init () {

        this.server.on('InternalError', (req, res, err, next) => {
            console.error(`Internal Error: ${err}`)
            res.send(500, ErrorHandler.defaultMessage)
            return next()
        })

        this.server.on('InternalServerError', (req, res, err, next) => {
            console.error(`Internal Server Error: ${err}`)
            res.send(500, ErrorHandler.defaultMessage)
            return next()
        })

        this.server.on('restifyError', (req, res, err, next) => {
            console.error(`Restify Error: ${err}`)
            res.send(500, ErrorHandler.defaultMessage)
            return next()
        })

        this.server.on('uncaughtException', (req, res, err, next) => {
            console.error(`Uncaught Exception: ${err}`)
            res.send(500, ErrorHandler.defaultMessage)
            return next()
        })

    }

    errorMessage(msg: any) {

        if (config.production) {
            return ErrorHandler.defaultMessage
        }
        let result = ErrorHandler.defaultMessage
        if (msg) {
            result.message = msg.message || msg.toString()
        }
        return result

    }
}