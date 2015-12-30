'use strict'
const Life = require('./Life');
const fs = require('fs-promise');
const co = require('co');
const sinon = require("sinon");

describe("the Life", function() {

  it("should export a constructor function", function() {
    Life.should.be.an.instanceOf(Function);
  });

  describe("instance", function() {
    let instance,
        docker = {
          listContainers: sinon.stub(),
          getContainer: sinon.stub()
        };

    beforeEach(function() {
      instance = new Life("test", "1", docker);
    });

    afterEach(function(){
      docker.listContainers.reset();
      docker.getContainer.reset();
    });

    it("should be a Life", function() {
      instance.should.be.an.instanceOf(Life);
    });

    describe("containerConfig", function(){
      let result;

      beforeEach(co.wrap(function*(){
        sinon.stub(fs, 'readFile')
          .returns(Promise.resolve(`test:`));

        because: {
          result = yield instance.containerConfig;
        }
      }));

      afterEach(function(){
        fs.readFile.restore();
      });

      it("should read the correct file", function(){
        fs.readFile.should.have.been.calledWith('config/spirits/test/lives/1/containerConfig.yml');
      });

      it("should return yaml", function(){
        result.should.equal(`test:`);
      });
    });

    describe("container", function(){
      let result;

      beforeEach(co.wrap(function*(){
        docker.listContainers.returns(Promise.resolve([
          {Id: 'abcd123'}
        ]));

        docker.getContainer.returns(Promise.resolve({
          id: 'abcd123'
        }));

        because: {
          result = yield instance.container;
        }
      }));

      it("should filter correctly", function(){
        docker.listContainers.should.have.been.calledWith({
          all: true,
          filters: '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"]}'
        });
      });

      it("should get the right container", function(){
        docker.getContainer.should.have.been.calledWith('abcd123');
      });

      it("should return the container", function(){
        result.should.deep.equal({id:'abcd123'});
      });
    });

    describe("status stopped", function(){
      let result;

      beforeEach(co.wrap(function*(){
        docker.listContainers
          .returns(Promise.resolve([]));

        because: {
          result = yield instance.status;
        }
      }));

      it("should filter correctly", function(){
        docker.listContainers.should.have.been.calledWith({
          filters: '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"],"status":["running"]}'
        });
      });

      it("should be stopped", function(){
        result.should.deep.equal('stopped');
      });
    });

    describe("status running", function(){
      let result;

      beforeEach(co.wrap(function*(){
        docker.listContainers
          .returns(Promise.resolve([{}]));

        because: {
          result = yield instance.status;
        }
      }));

      it("should filter correctly", function(){
        docker.listContainers.should.have.been.calledWith({
          filters: '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"],"status":["running"]}'
        });
      });

      it("should be stopped", function(){
        result.should.deep.equal('running');
      });
    });
  });
});