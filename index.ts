import * as config from 'config'

import { Utilities, RouteServer, ErrorHandler } from './common'
import { Router } from './routes/router'

if (!Utilities.preconditionCheck()) {
    console.error('One or more preconditions for startup were not met. Check log for details. Process terminated')
    process.exit(1)
}

const rs = new RouteServer()
console.log('Starting Server')
const server = rs.init()

const errorHandler = new ErrorHandler(server)

const router = new Router(server, errorHandler)
router.init(config.apiPrefix)

rs.start()
