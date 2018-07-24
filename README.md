# express-helpers

Utilities to help with using express on node.

This library only has a single runtime dependency on `debug` for debugging statements (`DEBUG=Routes`).

## Compatibility

- Requires `node 8+`

- Requires `express 4+`

## Usage

`Routes` is a class that will load all your services (if they expose a `routes` property) and register the routes with
express.

Given a class `UserService`, you need to add the routes that this service will accept, and give the handler function
that will implement the route.
You specify routes per http verb, e.g. get, post, put, delete..

```javascript
UserService.routes = {
    get: [
      { path: '/user/:email',
        func: expressUtil.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      }
    ],
    post: [
      { path: '/user',
        func: expressUtil.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      }
    ]
};
```

In the above code, you add adding an express route that handle a http get request to `/user/:email` and a route that
will handle a post request to `/user`.

You will notice that each handler function is the result of calling `expressUtil.awaitHandlerFactory`. This helper
function (found in the `expressUtil.js` file) wraps a handler function so that you can call it from express middleware
using async/await syntax;

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

  //directly add some get routes to app if you like, then
  routes.addGetRoutes();
```

This will register every `get` route for every service with the express app.
You need to pass the absolute path to the `services` directory to the `Routes`.
The `pathPrefix` is optional and will append the prefix to every route, e.g. `/my-app/user/:email`.

## Rationale

This module attempts to add the following abilities to your code:

- you don't need to `require` in any services into the `server.js` file. This means you only have to add service classes to your `services` directory and they will be picked up automatically and have their routes registered.

- you don't need to remember to add routes to express - you just add them to the `routes` object.

- keeping your routes co-located with the service code that will be called from the route handler, keeps all your related code in one place

- calling express middleware in async/await syntax can be seen as cleaner

## expressUtil

This module exposes some small helper functions.

- `writeResponse`

This function wrapes sending an express response and sets the statusCode if the handler errorred.

- `logErrors`

This function is a small express middleware to log errors to `stderr`.

- `sendErrorToClient`

This functio is a small express middleware to not sanitise any error before sending to the client.

You can use these function like so:

```javascript
  app.use(expressUtil.logErrors);
  app.use(expressUtil.sendErrorToClient);
  // ... add other stuff to express
  app.listen(port, hostname);
```

This will ensure that all errors are logged on the server but none are leaked to the client.

- `awaitHandlerFactory`

This function allows you to call express routes using async/await syntax, e.g.

```javascript
  expressUtil.awaitHandlerFactory(async (req, res, next) => {
    // ... route handler code goes here
  });
```
