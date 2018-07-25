const { helpers } = require('../../../src/index');

GoodService = {};

GoodService.routes = {
    get: [
      { path: '/user/:email',
        func: helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      }
    ],
    post: [
      { path: '/user',
        func: helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      }
    ]
};

module.exports = GoodService;
