'use strict';

const express = require('express');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiExpect = require('chai').expect;
const request = require('supertest');
chai.use(sinonChai);

const helpers = require('../src/helpers');

describe('Helper tests', function() {
  let app, spy;
  before(function() {
    spy = sinon.spy(helpers.sendErrorToClient);
    app = express();
    app.use(spy);

    app.get('/test', function(req, res, next) {
      res.status(200).send('');
      next();
    });

    app.get('/error', function(req, res, next) {
      const err = new Error('test error');
      next(err);
    });
  });

  it('elides errors', function() {
    request(app)
      .get('/error')
      .expect('Content-Type', /text\/html/)
      .expect(500)
      .end(function(err, res) {
        if (err) throw err;
      });
    //chaiExpect(spy).to.have.been.called();
  });

  it('gets called even if there are no errors', function() {
    request(app)
      .get('/test')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      /* eslint no-unused-vars: off */
      .end(function(err, res) {
        if (err) throw err;
      });
    //chaiExpect(spy).to.have.been.called();
  });
});
