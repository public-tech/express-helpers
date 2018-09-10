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

`Routes` is a class that will load all your routes and register the routes with express.

Given a class `UserRoutes`, you need to expose a `routes` property. You need to add the routes and give the handler function that will implement the route.
You specify routes per http verb, e.g. get, post, put, delete..

```javascript
//UserRoutes.js

const { helpers } = require('express-helpers');

UserRoutes = {};

//`routes` needs to be accessible on the module
UserRoutes.routes = {
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

module.exports = UserRoutes;
```

In the above code, you add adding an express route that handle a `HTTP GET` request to `/user/:email` and a route that
will handle a post request to `/user`.

You specify and array of handler functions per route and specify routes per HTTP verb.
Currently, `GET, POST, PUT and DELETE` are the supported verbs.

You will notice that each handler function is the result of calling `helpers.awaitHandlerFactory`. This helper
function (found in the `helpers` module) wraps a handler function so that you can use `async/await` syntax in your handler function. This is optional.

Once you have added `routes` properties, you can then register all the routes with express. You should place all your routes in the same directory.
Keeping your routes separate from your services will allow for easy unit and integration testing.

Given an app structure of:

<pre>
app
|
|---routes
|       |
|       UserRoutes.js
|       RecordRoutes.js
|
server.js
</pre>

in `server.js`, when you initialise `express`, you can then register all the routes for all the routes in the `routes` directory:

```javascript
  const express = require('express');
  const { Routes } = require('express-helpers');

  const app = express();
  const pathPrefix = '/my-app';
  const routes = new Routes(app, path.join(__dirname, './routes'), pathPrefix);

  //add all handlers to the express app
  routes.addAllRoutes();
  //or add routes by verb, e.g. add all post routes using routes.addPostRoutes(), or add all delete routes..
```

This will register every Route module that exposes a `routes` property that is found in the `routes` directory.
In addition, this will then register every `get` route for every registered module with the express app.
You need to pass the absolute path to the `routes` directory to the `Routes`.
The `pathPrefix` is optional and will append the prefix to every route, e.g. a prefix of `my-app` will mean that the path to handlers looks like: `/my-app/user/:email`.

Alternativly, you can directly register a `routes` object with the express app:

```javascript
  const express = require('express');
  const { Routes } = require('express-helpers');

  const app = express();
  const routes = new Routes(app); //don't register any Routes objects from a directory
  const someRouteObj = { 
    get: [
      {path:'/somepath', funcs: [someFunc]}
    ]
  };

  routes.addRawRoutes(someRouteObj);
```

This is useful when unit/integration testing your app and you just want to test a route without creating a dummy `Routes` module.

- `add400Handlers()`

This will add 400 handlers for any route that is not already handled.

```javascript
  const express = require('express');
  const { Routes } = require('express-helpers');

  const app = express();
  const pathPrefix = '/my-app';
  const routes = new Routes(app, path.join(__dirname, './routes'), pathPrefix);

  routes.addAllRoutes();
  routes.add400Handlers(); //anything not handled by the registered handlers will end up here.
```

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

This function is a small express middleware to sanitise any error before sending to the client.

You can use these function like so:

```javascript
  app.use(helpers.logErrors);
  app.use(helpers.sendErrorToClient);
  // ... add other stuff to express
  app.listen(port, hostname);
```

This will ensure that all errors are logged on the server but none are leaked to the client.
With the `logErrors` and `sendErrorToClient` middlewares enabled, your route handling code just needs to call `next` on an error:

```javascript
  helpers.awaitHandlerFactory(async (req, res, next) => {
    try {
      const result = await someAsyncProcess();
      if(result.success){
        //do awesome things
      }
    } catch(err){
      next(err);  //will log the error on the server (console) and then call `sendErrorToClient` with the error;
    }
  });  
```

- `sendInvalidApiCall`

This function is a small express middleware that will send a 400 error to the caller;

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
