# express-helpers

Utilities to help with using express on node.

This library only has a single runtime dependency on `debug` for debugging statements.

## Compatibility

Requires `node 8+`.

Requires `express 4+`.

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

app
|
|---services
|       |
|       UserService.js
|       RecordService.js
|
server.js

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
Note that you don't need to `require` in any services into the `server.js` file.


### expressUtil

This module exposes some small helper functions.

`writeResponse`

This function wrapes sending an express response and sets the statusCode if the handler errorred.

`logErrors`

This function is a small express middleware to log errors to `stderr`.

`sendErrorToClient`

This functio is a small express middleware to not sanitise any error before sending to the client.

`awaitHandlerFactory`

This function allows you to call express routes using async/await syntax, e.g.

```javascript
  expressUtil.awaitHandlerFactory(async (req, res, next) => {
    // ... route handler code goes here
  });
```
