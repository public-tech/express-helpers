'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('Routes');

const helpers = require('./helpers');

const verbs = ['get', 'post', 'delete', 'put'];

class Routes {
    /**
     * Initialise the routes.
     * @param {app}     expressApp and instance of the express app
     * @param {string}  absPath the absolute path of the directory that contains all the services with routes
     * @param {string}  pathPrefix [optional] path to prefix to all the routes
     */
    constructor(expressApp, absPath, pathPrefix) {
        const pathIsGood = fs.existsSync(absPath);
        if(pathIsGood){
            const isDir = fs.statSync(absPath).isDirectory();
            if(isDir){
                this.app = expressApp;
                this.services = [];
                this.serviceDirAbsPath = absPath;
                this.pathPrefix = pathPrefix;
                //work out the relative path (starting with ./) from this file to the dir containing the services
                this.serviceDirRelPath = `./${path.relative(__dirname, absPath)}`;
                this._addServices();
            } else {
                throw new Error(`Invalid absolute path passed to Routes constructor - it needs to be a directory: ${absPath}`);                
            }
        } else {
            throw new Error(`Invalid absolute path passed to Routes constructor: ${absPath}`);
        }
    }

    /**
     * Add all the service classes.
     */
    _addServices(){
        const serviceRoutesAreValid = service => {
            const validate = function(verb){
                if(service.routes[verb]){
                    service.routes[verb].forEach(route => {
                        if(!route.path || !route.funcs){
                            throw new Error(`Misconfigured ${verb} route. Route path is '${route.path}'`);
                        }
                    });
                }
            }
            verbs.forEach(validate);
            return true;
        };

        debug('parsing routes for services..');
        fs
          .readdirSync(this.serviceDirAbsPath)
          .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
          })
          .forEach(file => {
            const service = require(`${this.serviceDirRelPath}/${file}`);
            const serviceToUse = service.default ? service.default : service;

            if(serviceToUse.routes){
                serviceRoutesAreValid(service);
                debug(`parsing routes for service: ${file}`);
                this.services.push({filename: file, routes: serviceToUse.routes});
            }
          });
      };

    /**
     * Add all the routes for a particular HTTP verb
     * @param {String} verb 
     */
    _addVerb(verb){
        this.services.forEach(service => {
            if(service.routes[verb] && service.routes[verb].length > 0){
                debug(`adding ${verb} routes for: ${service.filename}`);
                service.routes[verb].forEach(route => {
                    this.app[verb](`${this.pathPrefix}${route.path}`, ...route.funcs);
                });
            }
        });
    };

    /**
     * Add all the HTTP GET routes to the express app.
     */
    addGetRoutes() {
        this._addVerb('get');
    };
    
    /**
     * Add all the HTTP POST routes to the express app.
     */
    addPostRoutes(){
        this._addVerb('post');
    };

    /**
     * Add all the HTTP DELETE routes to the express app.
     */
    addDeleteRoutes(){
        this._addVerb('delete');
    };

    /**
     * Add all the HTTP PUT routes to the express app.
     */
    addPutRoutes(){
        this._addVerb('put');
    };

    /**
     * Add all the routes for all the HTTP verbs to the express app.
     */
    addAllRoutes() {
        verbs.forEach(verb => {
            const func = `add${verb.charAt(0).toUpperCase() + verb.slice(1)}Routes`;
            this[func]();
        });
    };

    /**
     * Add 404 handlers for each HTTP verb to the express app.
     * This is useful if you have an API server and want to return a standard response for all 404s.
     */
    add404Handlers() {
        verbs.forEach(verb => {
            this.app[verb]('/*', helpers.awaitHandlerFactory(async (req, res, next) => {
                debug(`unknown ${verb} route: ${req.path}`);
                res.status(404);
                res.json({'unknownRoute': true});
            }));
        });
    };
};

module.exports.Routes = Routes;
module.exports.helpers = helpers;
