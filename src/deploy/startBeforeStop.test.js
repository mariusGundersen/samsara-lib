import startBeforeStop from './startBeforeStop';
import sinon from 'sinon';
import {Jar, withArgs, withExactArgs} from 'descartes';

describe("startBeforeStop", function(){
  it("should be a function", function(){
    startBeforeStop.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      const jar = new Jar();
      this.clock = sinon.useFakeTimers();
      this.startSpy = jar.probe('container.start');
      this.stopSpy = jar.probe('container.stop');
      this.logSpy = jar.sensor('log.message');
      this.stageSpy = jar.sensor('log.stage');
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", async function(){
      const result = startBeforeStop({start: this.startSpy, id: 'startId'}, {stop: this.stopSpy, id: 'stopId'}, {message: this.logSpy, stage: this.stageSpy});

      await this.logSpy.called(withArgs('Starting new container'));

      await this.startSpy.called();

      await this.logSpy.called(withArgs('Container startId started'));

      await this.stageSpy.called();

      await this.logSpy.called(withArgs('Waiting 5 seconds'));

      this.clock.tick(5000)

      await this.logSpy.called(withArgs('Waited 5 seconds'));

      await this.logSpy.called(withArgs('Stopping previous container'));

      await this.stopSpy.called();

      await this.logSpy.called(withArgs('Container stopId stopped'));
    });
  });

  describe("when called without any container to stop", function(){
    beforeEach(function(){
      const jar = new Jar();
      this.clock = sinon.useFakeTimers();
      this.startSpy = jar.probe();
      this.stopSpy = jar.sensor();
      this.logSpy = jar.sensor();
      this.stageSpy = jar.sensor();
    });

    afterEach(function(){
      this.clock.restore();
    });

    it("should do things in the right order", async function(){
      const result = startBeforeStop({start: this.startSpy, id: 'startId'}, null, {message: this.logSpy, stage: this.stageSpy});

      await this.logSpy.called(withArgs('Starting new container'));

      await this.startSpy.called();

      await this.logSpy.called(withArgs('Container startId started'));

      await this.stageSpy.called();

      await this.logSpy.called(withArgs('No container to stop'));
    });
  });
});
