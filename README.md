# express-helpers

Utilities to help with using express on node.

This library only has a single runtime dependency on `debug` for debugging statements (`DEBUG=Routes`).

## Compatibility

- Requires `node 8+`

- Requires `express 4+`

## Rationale

This module attempts to add the following abilities to your code:

- you don't need to `require` in any services into the `server.js` file. This means you only have to add service classes to your `services` directory and they will be picked up automatically and have their routes registered.

- you don't need to remember to add routes to express - you just add them to the `routes` object of the service you are working on.

- keeping your routes co-located with the service code that will be called from the route handler, keeps all your related code in one place

- using express middleware with async/await syntax can be seen as cleaner or more preferable

## Usage

`Routes` is a class that will load all your services (if they expose a `routes` property) and register the routes with
express.

Given a class `UserService`, you need to add the routes that this service will accept, and give the handler function
that will implement the route.
You specify routes per http verb, e.g. get, post, put, delete..

```javascript
//UserService.js

const { helpers } = require('express-helpers');

UserService = {};

//`routes` needs to be accessible on the module
UserService.routes = {
    get: [
      { path: '/user/:email',
        funcs: [
          someMiddleWare,
          helpers.awaitHandlerFactory(async (req, res, next) => {
            const result = await someAsyncProcess();
          }),
          anotherFunction(req, res, next)
        ]
      }
    ],
    post: [
      { path: '/user',
        funcs: [
          helpers.awaitHandlerFactory(async (req, res, next) => {
            //lots of awesome code
          });
        ]
      }
    ]
};

module.exports = UserService;
```

In the above code, you add adding an express route that handle a `HTTP GET` request to `/user/:email` and a route that
will handle a post request to `/user`.

You specify and array of handler functions per route and specify routes per HTTP verb.
Currently, `GET, POST, PUT and DELETE` are the supported verbs.

You will notice that each handler function is the result of calling `helpers.awaitHandlerFactory`. This helper
function (found in the `helpers` module) wraps a handler function so that you can use `async/await` syntax in your handler function. This is optional.

Once you have added `routes` properties to your services, you can then register all the services with express. You
should place all your services in the same directory.

Given an app structure of:

<pre>
app
|
|---services
|       |
|       UserService.js
|       RecordService.js
|
server.js
</pre>

in `server.js`, when you initialise `express`, you can then register all the routes for all the services in the 
`services` directory.

```javascript
  const express = require('express');
  const { Routes } = require('express-helpers');

  const app = express();
  const pathPrefix = '/my-app';
  const routes = new Routes(app, path.join(__dirname, './service'), pathPrefix);

  //add just the get routes to app
  routes.addGetRoutes();
  //or add all routes to app
  //routes.addAllRoutes();
```

This will register every `get` route for every service with the express app.
You need to pass the absolute path to the `services` directory to the `Routes`.
The `pathPrefix` is optional and will append the prefix to every route, e.g. `/my-app/user/:email`.

## helpers

This module exposes some small helper functions.
To use the module:

```javascript
const { helpers } = require('express-helpers');`
```

- `writeResponse`

This function wrapes sending an express response and sets the statusCode if the handler errorred.

- `logErrors`

This function is a small express middleware to log errors to `stderr`.

- `sendErrorToClient`

This function is a small express middleware to not sanitise any error before sending to the client.

You can use these function like so:

```javascript
  app.use(helpers.logErrors);
  app.use(helpers.sendErrorToClient);
  // ... add other stuff to express
  app.listen(port, hostname);
```

This will ensure that all errors are logged on the server but none are leaked to the client.

- `awaitHandlerFactory`

This function allows you to use async/await syntax within handler functions.

```javascript
  helpers.awaitHandlerFactory(async (req, res, next) => {
    const result = await someAsyncProcess();
    if(result.success){
      //do awesome things
    }
  });
```
