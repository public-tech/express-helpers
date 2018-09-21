const { helpers } = require('../../../src/index');

/* eslint no-undef: off */
AnotherGoodService = {};

AnotherGoodService.routes = {
  get: [
    {
      path: '/service2',
      funcs: [
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        }),
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      ]
    }
  ],
  put: [
    {
      path: '/service3',
      funcs: [
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        }),
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      ]
    }
  ]
};

module.exports = AnotherGoodService;
