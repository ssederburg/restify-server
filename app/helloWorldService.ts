import { ResponseModel } from '../common'

export class HelloWorldService {

    public static get(): Promise<ResponseModel> {
        
        const result: ResponseModel = new ResponseModel()
        result.message = 'Hello World'
        return Promise.resolve(result);

    }

}
