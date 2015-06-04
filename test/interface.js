var samsara = require('../index');
var expect = require('expect.js');
var sinon = require('sinon');

describe("the module", function(){
  
  it("should export a function", function(){
    expect(samsara).to.be.a(Function);
  });
  
  describe("instance", function(){
    var instance;
    
    beforeEach(function(){
      instance = samsara();
    });
  
    it("should be an object", function(){
      expect(instance).to.be.an(Object);
    });
  
    it("should have a way to get all spirits", function(){
      expect(instance.spirits).to.be.a(Function);
    });
  
    it("should have a way to get one spirit", function(){
      expect(instance.spirit).to.be.a(Function);
    });
  
    it("should have a way to create a spirit", function(){
      expect(instance.createSpirit).to.be.a(Function);
    });
    
    describe("spirits method", function(){
      
      it("should return an enumerable list of spirits", function(){
        expect(instance.spirits().any).to.be.a(Function);
      });
    
    });
  
  });
  
});