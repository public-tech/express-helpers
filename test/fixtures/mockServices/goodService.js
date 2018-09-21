const { helpers } = require('../../../src/index');

/* eslint no-undef: off */
GoodService = {};

GoodService.routes = {
  get: [
    {
      path: '/service1',
      funcs: [
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      ]
    }
  ],
  post: [
    {
      path: '/post1',
      funcs: [
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      ]
    }
  ]
};

module.exports = GoodService;
