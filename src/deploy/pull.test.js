const co = require('co');
const pull = require('./pull');
const sinon = require('sinon');
const descartes = require('descartes');

const withExactArgs = descartes.withExactArgs;
const withArgs = descartes.withArgs;

describe("pull", function(){
  it("should be a function", function(){
    pull.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      const jar = new descartes.Jar();
      this.logSpy = jar.sensor('log');
      this.stream = {};
      this.docker = {
        pull: jar.probe('pull'),
        modem: {
          followProgress: jar.probe('followProgress')
        }
      };
    });

    it("pull the image", co.wrap(function*(){
      const test = pull('test', 'latest', this.docker, this.logSpy);

      yield this.logSpy.called(withExactArgs('Pulling image test:latest'));

      this.docker.pull.resolves(this.stream);
      yield this.docker.pull.called(withExactArgs('test:latest'));

      this.docker.modem.followProgress.resolves(null);
      yield this.docker.modem.followProgress.called(withArgs(this.stream));

      yield this.logSpy.called(withExactArgs('Pulled image test:latest'));

      return yield test;
    }))
  });
});