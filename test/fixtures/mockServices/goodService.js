const { helpers } = require('../../../src/index');

GoodService = {};

GoodService.routes = {
    get: [
      { path: '/service1',
        funcs: [
          helpers.awaitHandlerFactory(async (req, res, next) => {
            // ... your code here
          })
        ]
      }
    ],
    post: [
      { path: '/post1',
        funcs: [
            helpers.awaitHandlerFactory(async (req, res, next) => {
            // ... your code here
          })
        ]
      }
    ]
};

module.exports = GoodService;
