'use strict'
const getSpiritNames = require('../src/getSpiritNames');
const fs = require('fs-promise');
const co = require('co');
const sinon = require("sinon");
const expect = chai.expect;

describe("getSpiritNames", function() {
  let result,
      docker;
  
  beforeEach(co.wrap(function*(){
    sinon.stub(fs, 'readdir')
      .returns(Promise.resolve(['Test', 'website', 'database']));
    
    sinon.stub(fs, 'stat')
      .returns(Promise.resolve({isDirectory(){return true}}));

    docker = {
      listContainers: sinon.stub().returns(Promise.resolve([
        {Labels:{'samsara.spirit.name':'Test'}},
        {Labels:{'samsara.spirit.name':'mail'}},
        {Labels:{'samsara.spirit.name':'database'}}
      ]))
    };
    
    because: {
      result = yield getSpiritNames(docker);
    }
  }));

  afterEach(function(){
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should read dir from the right directory", function(){
    fs.readdir.should.have.been.calledWith('config/spirits');  
  });

  it("should get all containers that are spirits", function(){
    docker.listContainers.should.have.been.calledWith({
      all: true, 
      filters: '{"label":["samsara.spirit.name", "samsara.spirit.life"]}'
    });  
  });
  
  it("should return names which are both containers and directories", function(){
    result.should.contain('Test');
    result.should.contain('database');
  });
  
  it("should return names which are only containers", function(){
    result.should.contain('mail');
  });
  
  it("should return names which are only directories", function(){
    result.should.contain('website');
  });
  
  it("should not return duplicates", function(){
    result.length.should.equal(4);
  });
  
  it("should return the spirits in sorted order", function(){
    result.should.eql(['database', 'mail', 'Test', 'website']);
  });
});