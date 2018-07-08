# restify server
Default scaffold for restify server in node. This is a work in progress.

## environment
Begin with `npm install`.

This project uses TypeScript with ts-node and nodemon for development. 

Execute `npm start` to run the server on the localhost with hot reload.

Execute `npm test` to execute unit tests (mocha).

Execute `npm run build` to create a production bundle ready to be deployed and stripped of any non-production artifacts. This process uses the localbuilder.ts and localbuilder.config.json scripts
to deploy. Final bundle does not include nodemon or TypeScript.

## quick start
1. Create a local copy of `.env` as a copy of `cfg.env`.
2. Create any environment variables desired inside `.env` with format:
    - `SOMEUID=JOE`
    - `SOMEPWD=SMITH`
3. Confirm entries in `config/default.json` and `config/production.json`
    - API Prefix path (default to `/api/`)
    - Serve Static Content (any non-empty string maps to root of project. Use absolute or relative paths. Defaults to `./public/`)
    - API Port (defaults to 8080)
4. Create services in new folder (ex. `/app/shoes`). Can mimic pattern within `/common/healthCheck.ts`.
5. Create route handler inside `/routes/router.ts` to map to new service above.
6. If services rely on an external database connection, be sure to wrap the `rs.start()` method call of `index.ts` inside the callback from that connections startup asynchronous method e.g. don't start the server until the database connection pool has been started up and any necessary seeding processes completed.
    - e.g. `database.connection.open((err) => if (!err) rs.start() )` <- where the parameter to the open method is an asynchronous callback called only after the connection is established.
7. Create Unit Tests in `./test/` folder for each new service method created.

## notes

### development
Running `npm start` uses hot reload meaning any changes to `*.ts` files (or others) causes `nodemon` to automatically restart the server with the changes.

Test any new services using your favorite REST tool like Rested, Postman, any modern browser etc.

Run any unit tests at any time in a new console using `npm test`.

You can place any static content into (default `./public/`) folder and those assets will be served statically over the API Port. The path used is mapped inside `/config/default.json`. Setting the variable `serveStaticPath` to an empty string or removing it from the configuration file results in no static content being served.
- The endpoint from the client maps to the root of the webserver e.g. `serveStaticPath="./public/"` will map any request to `localhost:8080/somefile.txt` to `process.cwd()/public/somefile.txt`
- Another example request `localhost:8080/shoes/vendors.json` would map to `process.cwd()/public/shoes/vendor.json`

### creating assets
Anything created in `./public/` will be served as is e.g. Angular, React, Vue, PWA

To create a new Web API:
1. Create Service file in `./app/` folder
2. Export Service Class from `./app/index.ts`
3. Create Route in `./routes/`
4. Export Route in `./routes/index.ts`
5. Import Route in `./routes/router.ts`
6. Create Route Handler inside `Router.init()` method
7. All handlers should be asynchronous
8. Write Unit Tests in `./test` folder for service
9. Document API in `swagger.json` document

### todo
1. Support for Swagger UI rendering off of `./swagger.io`
