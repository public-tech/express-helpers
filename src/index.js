'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('Routes');

const helpers = require('./helpers');

const verbs = ['get', 'post', 'delete', 'put'];

class Routes {
    /**
     * Register all services if required.
     * @param {app}     expressApp and instance of the express app
     * @param {string}  absPath [optional] the absolute path of the directory that contains all the services with routes
     * @param {string}  pathPrefix [optional] path to prefix to all the routes
     */
    constructor(expressApp, absPath, pathPrefix) {
        this.app = expressApp;
        if(absPath){
            const pathIsGood = fs.existsSync(absPath);
            if(pathIsGood){
                const isDir = fs.statSync(absPath).isDirectory();
                if(isDir){
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
     * This function is used to directly register a Routes object with the express app.
     * This can be useful in unit testing of routes, where you don't want to create dummy services in a directory
     * in order to add them.
     * @param {Routes} routes a routes object to register with the express app.
     */
    addRawRoutes(routes){
        verbs.forEach(verb => {
            this._addVerb(verb, routes);
        });
    }

    /**
     * Add all the routes for a particular HTTP verb
     * @param {String} verb 
     * @param {Routes} routes if specified, use the raw routes passed in
     */
    _addVerb(verb, routes){
        if(!routes){
            this.services.forEach(service => {
                if(service.routes[verb] && service.routes[verb].length > 0){
                    debug(`adding ${verb} routes for: ${service.filename}`);
                    service.routes[verb].forEach(route => {
                        this.app[verb](`${this.pathPrefix}${route.path}`, ...route.funcs);
                    });
                }
            });
        } else {
            if(routes[verb] && routes[verb].length > 0){
                debug(`adding ${verb} routes.`);
                routes[verb].forEach(route => {
                    this.app[verb](`${this.pathPrefix}${route.path}`, ...route.funcs);
                });
            }
        }

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
     * Add 400 handlers for each HTTP verb to the express app.
     * This is useful if you have an API server and want to return a standard response for all API calls that dont
     * have a handler registered.
     */
    add400Handlers() {
        verbs.forEach(verb => {
            this.app[verb]('/*', helpers.awaitHandlerFactory(async (req, res, next) => {
                debug(`unknown ${verb} route: ${req.path}`);
                helpers.sendInvalidApiCall();
            }));
        });
    };
};

module.exports.Routes = Routes;
module.exports.helpers = helpers;
