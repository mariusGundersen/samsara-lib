const startBeforeStop = require('./startBeforeStop');
const sinon = require('sinon');
const co = require('co');
const descartes = require('descartes');

describe("startBeforeStop", function(){
  it("should be a function", function(){
    startBeforeStop.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      const jar = new descartes.Jar();
      this.clock = sinon.useFakeTimers();
      this.startSpy = jar.probe('container.start');
      this.stopSpy = jar.probe('container.stop');
      this.logSpy = jar.sensor('log.message');
      this.stageSpy = jar.sensor('log.stage');
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", co.wrap(function*(){
      const result = startBeforeStop({start: this.startSpy, id: 'startId'}, {stop: this.stopSpy, id: 'stopId'}, {message: this.logSpy, stage: this.stageSpy});

      yield this.logSpy.called(descartes.withArgs('Starting new container'));

      yield this.startSpy.called();

      yield this.logSpy.called(descartes.withArgs('Container startId started'));

      yield this.stageSpy.called();

      yield this.logSpy.called(descartes.withArgs('Waiting 5 seconds'));

      this.clock.tick(5000)

      yield this.logSpy.called(descartes.withArgs('Waited 5 seconds'));

      yield this.logSpy.called(descartes.withArgs('Stopping previous container'));

      yield this.stopSpy.called();

      yield this.logSpy.called(descartes.withArgs('Container stopId stopped'));
    }));
  });

  describe("when called without any container to stop", function(){
    beforeEach(function(){
      const jar = new descartes.Jar();
      this.clock = sinon.useFakeTimers();
      this.startSpy = jar.probe();
      this.stopSpy = jar.sensor();
      this.logSpy = jar.sensor();
      this.stageSpy = jar.sensor();
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", co.wrap(function*(){
      const result = startBeforeStop({start: this.startSpy, id: 'startId'}, null, {message: this.logSpy, stage: this.stageSpy});

      yield this.logSpy.called(descartes.withArgs('Starting new container'));

      yield this.startSpy.called();

      yield this.logSpy.called(descartes.withArgs('Container startId started'));

      yield this.stageSpy.called();

      yield this.logSpy.called(descartes.withArgs('No container to stop'));
    }));
  });
});