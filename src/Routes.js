'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('Routes');

class Routes {

    /**
     * Initialise the routes.
     * @param {app}     expressApp and instance of the express app
     * @param {string}  absPath the absolute path of the directory that contains all the services with routes
     * @param {string}  pathPrefix [optional] path to prefix to all the routes
     */
        
    constructor(expressApp, absPath, pathPrefix) {
        this.app = expressApp;
        this.services = [];
        this.serviceDirAbsPath = absPath;
        this.pathPrefix = pathPrefix;
        //work out the relative path (starting with ./) from this file to the dir containing the services
        this.serviceDirRelPath = `./${path.relative(__dirname, absPath)}`;
        this._addServices();
    }

    addGetRoutes() {
        this.services.forEach(service => {
            if(service.routes.get){
                service.routes.get.forEach(getRoute => {
                    this.app.get(`${this.pathPrefix}${getRoute.path}`, getRoute.func);
                });
            }
        });
    };
    
    addPostRoutes(){
        this.services.forEach(service => {
            if(service.routes.post){
                service.routes.post.forEach(postRoute => {
                    this.app.get(`${this.pathPrefix}${postRoute.path}`, postRoute.func);
                });
            }
        });
    };

    /**
     * Add all the service classes.
     */
    _addServices(){
        debug('adding routes for services..');
        fs
          .readdirSync(this.serviceDirAbsPath)
          .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
          })
          .forEach(file => {
            const service = require(`${this.serviceDirRelPath}/${file}`);
            const serviceToUse = service.default ? service.default : service;
            if(serviceToUse.routes){
                debug(`adding routes for service: ${file}`);
                this.services.push(serviceToUse);
            };
          });
      };
};
module.exports = Routes;
