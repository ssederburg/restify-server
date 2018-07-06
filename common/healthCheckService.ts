import { Utilities } from './utilities'
import { ResponseModel } from './responseModel';

export class HealthCheckService {

    public static get(): Promise<ResponseModel> {
        
        const result: ResponseModel = new ResponseModel()
        //             Get Environment Variable List (  Obfuscate                ,  Remove         )
        result.data = Utilities.environmentVariables([],[])
        result.message = 'No Rest for Old Men'
        return Promise.resolve(result);

    }

}
