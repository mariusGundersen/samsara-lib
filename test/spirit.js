'use strict'
const Spirit = require('../src/Spirit');
const fs = require('fs-promise');
const co = require('co');
const sinon = require("sinon");
const expect = chai.expect;

describe("the Spirit", function() {
  
  it("should export a constructor function", function() {
    Spirit.should.be.an.instanceOf(Function);
  });
  
  describe("instance", function() {
    let instance;
    
    beforeEach(function() {
      instance = new Spirit("test");
    });
  
    it("should be a Spirit", function() {
      instance.should.be.an.instanceOf(Spirit);
    });
  
    it("should have a way to get the config", function() {
      instance.config.should.be.an.instanceOf(Function);
    });
  
    it("should have a way to determine if it is deploying", function() {
      instance.isDeploying.should.be.an.instanceOf(Function);
    });
    
    describe("isDeploying", function(){
      beforeEach(function(){
        sinon.stub(fs, 'exists')
          .returns(true);
        
        because: {
          instance.isDeploying();
        }
      });
      
      afterEach(function(){
        fs.exists.restore();
      });
      
      it("should check if the right file exists", function(){
        fs.exists.should.have.been.calledWith('config/spirits/test/deploy.lock');  
      });
    });
    
    describe("config", function(){
      let result;
      
      beforeEach(co.wrap(function*(){
        sinon.stub(fs, 'readFile')
          .returns(Promise.resolve(JSON.stringify({name:'test'})));
        
        because: {
          result = yield instance.config();
        }
      }));
      
      afterEach(function(){
        fs.readFile.restore();
      });
      
      it("should read the correct file", function(){
        fs.readFile.should.have.been.calledWith('config/spirits/test/config.json');
      });
      
      it("should return json", function(){
        result.should.deep.equal({name:'test'});
      });
    });
  });
});