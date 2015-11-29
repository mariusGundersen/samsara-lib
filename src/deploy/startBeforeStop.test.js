const startBeforeStop = require('./startBeforeStop');
const sinon = require('sinon');
const co = require('co');

describe("startBeforeStop", function(){
  it("should be a function", function(){
    startBeforeStop.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      this.clock = sinon.useFakeTimers();
      this.startSpy = sinon.stub().returns(Promise.resolve());
      this.stopSpy = sinon.stub().returns(Promise.resolve());
      this.logSpy = sinon.spy(m => m == 'Waiting 5 seconds' && Promise.resolve().then(() => this.clock.tick(5000)));
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", co.wrap(function*(){

      yield startBeforeStop({start: this.startSpy}, {stop: this.stopSpy}, this.logSpy);

      this.logSpy.should.have.been.calledWith('Starting new container');

      this.startSpy.should.have.been.calledOnce;

      this.logSpy.should.have.been.calledWith('Container started');

      this.logSpy.should.have.been.calledWith('Waiting 5 seconds');

      this.logSpy.should.have.been.calledWith('Waited 5 seconds');

      this.logSpy.should.have.been.calledWith('Stopping previous container');

      this.stopSpy.should.have.been.calledOnce;

      this.logSpy.should.have.been.calledWith('Container stopped');
    }));
  });

  describe("when called without any container to stop", function(){
    beforeEach(function(){
      this.clock = sinon.useFakeTimers();
      this.startSpy = sinon.stub().returns(Promise.resolve());
      this.stopSpy = sinon.spy();
      this.logSpy = sinon.spy();
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", co.wrap(function*(){

      yield startBeforeStop({start: this.startSpy}, null, this.logSpy);

      this.logSpy.should.have.been.calledWith('Starting new container');

      this.startSpy.should.have.been.calledOnce;

      this.logSpy.should.have.been.calledWith('Container started');

      this.stopSpy.should.not.have.been.called;
    }));
  });
});