'use strict';

const { expect } = require('chai');
const express = require('express');
const fs = require('fs');
const path = require('path');

const { Routes } = require('../src/index');

describe('Routes constructor tests', function() {
  it('throws an error if path to services is not a valid path', function() {
    const app = express();
    const absPath = '';
    const prefix = '';
    
    function runConstructor(){
      const routes = new Routes(app, absPath, prefix);
    }
    expect(runConstructor).to.throw('Invalid absolute path passed to Routes constructor:');
  });

  it('throws an error if path to services is not a directory', function() {
    const app = express();
    const absPath = __filename;
    const prefix = '';
    
    function runConstructor(){
      const routes = new Routes(app, absPath, prefix);
    }
    expect(runConstructor).to.throw('Invalid absolute path passed to Routes constructor - it needs to be a directory');
  });
});

describe('Routes parsing tests', function() {

  let app, routes;

  before(function(){
    app = express();
    const absPath = path.join(__dirname, './fixtures/mockServices');
    const prefix = '';
    routes = new Routes(app, absPath, prefix);
  });

  it('ignores non .js files when loading all services in a directory', function() {
    expect(routes.services.length).to.equal(2); //good and bad services
  });

  it('parses all the good services and routes', function() {
    const anotherGoodService = routes.services[0];
    expect(anotherGoodService.filename).to.equal('anotherGoodService.js');
    expect(anotherGoodService.routes.get.length).to.equal(1);
    expect(anotherGoodService.routes.post).to.be.undefined;

    const goodService = routes.services[1];
    expect(goodService.filename).to.equal('goodService.js');
    expect(goodService.routes.get.length).to.equal(1);
    expect(goodService.routes.post.length).to.equal(1);
  });
});

describe('Routes parsing tests with a bad service', function() {

  let app, absPath, prefix;

  before(function(){
    app = express();
    absPath = path.join(__dirname, './fixtures/mockServices');
    prefix = '';

    //rename badService.js.rename to badService
   fs.rename(path.join(absPath, 'badService.js.rename'), path.join(absPath, 'badService.js'), 
    function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
  });

  after(function(){
    const absPath = path.join(__dirname, './fixtures/mockServices');
    //rename badService to badService.rename
    fs.rename(path.join(absPath, 'badService.js'), path.join(absPath, 'badService.js.rename'), 
    function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
  });

  it('does not load bad service routes', function() {
    function loadBadServices(){  
      const routes = new Routes(app, absPath, prefix);
    }
    expect(loadBadServices).to.throw('Misconfigured');
  });

});

describe('Routes route addition tests', function() {
  let app, routes;
  before(function(){
    app = express();
    const absPath = path.join(__dirname, './fixtures/mockServices');
    const prefix = '';
    routes = new Routes(app, absPath, prefix);
  });

  it('adds get routes without error', function(){

    function addGetRoutes(){
      routes.addGetRoutes();
    }
    expect(addGetRoutes).to.not.throw();
    expect(app._router.stack.length).to.equal(4);  //there are 2 default express routes and our 2 get routes
  });

  it('adds post routes without error', function(){
    function addPostRoutes(){
      routes.addPostRoutes();
    }
    expect(addPostRoutes).to.not.throw();
    expect(app._router.stack.length).to.equal(5);  //there are 2 default express routes and our 2 get routes and 1 post
  });

  it('adds all routes without error', function(){
    function addAllRoutes(){
      routes.addAllRoutes();
    }
    expect(addAllRoutes).to.not.throw();
    expect(app._router.stack.length).to.equal(9); //express allows duplicate handlers
  });

  it('adds 404 wildcard handlers without error', function(){

    function add404Handlers(){
      routes.add404Handlers();
    }
    expect(add404Handlers).to.not.throw();
    expect(app._router.stack.length).to.equal(13);  //there are 4 verbs so we should add 4 handlers
  });
});