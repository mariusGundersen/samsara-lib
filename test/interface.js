'use strict'
const samsara = require('../index');
const sinon = require('sinon');

describe("the module", function(){
  
  it("should export a function", function(){
    expect(samsara).to.be.an.instanceOf(Function);
  });
  
  describe("instance", function(){
    let instance;
    
    beforeEach(function(){
      instance = samsara();
    });
  
    it("should be an object", function(){
      instance.should.be.an.instanceOf(Object);
    });
  
    it("should have a way to get all spirits", function(){
      instance.spirits.should.be.an.instanceOf(Function);
    });
  
    it("should have a way to get one spirit", function(){
      instance.spirit.should.be.an.instanceOf(Function);
    });
  
    it("should have a way to create a spirit", function(){
      instance.createSpirit.should.be.an.instanceOf(Function);
    });
    
    describe("spirits method", function(){
      
      it("should return an enumerable list of spirits", function(){
        instance.spirits().any.should.be.an.instanceOf(Function);
      });
    
    });
  
  });
  
});