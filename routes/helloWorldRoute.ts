import { ErrorHandler } from '../common/'
import { HelloWorldService } from '../app/';

export class HelloWorldRoute {
    
    public constructor (private server: any, private errorHandler: ErrorHandler) {}

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
            
                const result = await HelloWorldService.get()
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