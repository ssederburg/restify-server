import { ErrorHandler, SwaggerService } from '../common/'

export class SwaggerRoute {
    
    public constructor (private server: any, private errorHandler: ErrorHandler) {}

    public init (path: string) {

        const swaggerService = new SwaggerService(this.server, this.errorHandler)

        this.server.get(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
            
                const result = await swaggerService.get()
                res.send(200, result)
            
                return next();        
            }
            catch (err) {
                console.error(err)
                res.send(500, this.errorHandler.errorMessage('HelloWorldRoute:Error'))
                return next()
            }

        })

    }

}