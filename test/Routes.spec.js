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

describe('Routes constructor tests - service loading', function() {

  let routes, app, absPath, prefix;

  before(function(){
    app = express();
    absPath = path.join(__dirname, './fixtures/mockServices');
    prefix = '';
    routes = new Routes(app, absPath, prefix);
  });

  it('ignores non .js files when loading all services in a directory', function() {
    expect(routes.services.length).to.equal(1); //good and bad services
  });

  it('loads all the good services and routes', function() {
    const goodService = routes.services[0];
    expect(goodService.routes.get.length).to.equal(1);
    expect(goodService.routes.post.length).to.equal(1);
  });
});

describe('Routes constructor tests - service loading - bad service', function() {

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

describe('Route addition tests', function() {
  it('adds get and post routes without error', function(){
    const app = express();
    const absPath = path.join(__dirname, './fixtures/mockServices');
    const prefix = '';
    const routes = new Routes(app, absPath, prefix);

    function addGetRoutes(){
      routes.addGetRoutes();
    }
    expect(addGetRoutes).to.not.throw();

    function addPostRoutes(){
      routes.addPostRoutes();
    }
    expect(addPostRoutes).to.not.throw();

  });
});