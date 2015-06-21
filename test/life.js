'use strict'
const Life = require('../src/Life');
const fs = require('fs-promise');
const co = require('co');
const sinon = require("sinon");
const expect = chai.expect;

describe("the Life", function() {
    
  it("should export a constructor function", function() {
    Life.should.be.an.instanceOf(Function);
  });
  
  describe("instance", function() {
    let instance;
    
    beforeEach(function() {
      instance = new Life("test", "1");
    });
  
    it("should be a Life", function() {
      instance.should.be.an.instanceOf(Life);
    });
  
    it("should have a way to get the config", function() {
      instance.config.should.be.an.instanceOf(Function);
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
        fs.readFile.should.have.been.calledWith('config/spirits/test/lives/1/config.json');
      });
      
      it("should return json", function(){
        result.should.deep.equal({name:'test'});
      });
    });
  });
});