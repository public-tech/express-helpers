const { helpers } = require('../../../src/index');

AnotherGoodService = {};

AnotherGoodService.routes = {
    get: [
      { path: '/service2',
        funcs: [
          helpers.awaitHandlerFactory(async (req, res, next) => {
            // ... your code here
          }),
          helpers.awaitHandlerFactory(async (req, res, next) => {
            // ... your code here
          })
        ]
      }
    ]
    // no POST routes
};

module.exports = AnotherGoodService;
