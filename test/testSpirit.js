var Spirit = require('../src/Spirit');
var expect = require('expect.js');
var sinon = require('sinon');

describe("the Spirit", function(){
  
  it("should export a constructor function", function(){
    expect(Spirit).to.be.a(Function);
  });
  
  describe("instance", function(){
    var instance;
    
    beforeEach(function(){
      instance = new Spirit();
    });
  
    it("should be a Spirit", function(){
      expect(instance).to.be.a(Spirit);
    });
  
    it("should have a way to get the config", function(){
      expect(instance.config).to.be.a(Function);
    });
  
    it("should have a way to determine if it is deploying", function(){
      expect(instance.isDeploying).to.be.a(Function);
    });
      
  });
  
});