import { Utilities } from './utilities'
import { ResponseModel } from './responseModel';

export class HealthCheckService {

    public static get(): Promise<ResponseModel> {
        
        const result: ResponseModel = new ResponseModel()
        result.data = {
            RunningProperly: true
        }
        result.message = 'No Rest for Old Men'
        return Promise.resolve(result);

    }

}
