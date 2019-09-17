import { helpers } from '../../../src/index';

export const routes = {
  get: [
    {
      path: '/typescript-get',
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
      path: '/typescript-post',
      funcs: [
        /* eslint no-unused-vars: off */
        helpers.awaitHandlerFactory(async (req, res, next) => {
          // ... your code here
        })
      ]
    }
  ]
};
