const stopBeforeStart = require('./stopBeforeStart');
const sinon = require('sinon');
const co = require('co');
const descartes = require('descartes');

describe("stopBeforeStart", function(){
  it("should be a function", function(){
    stopBeforeStart.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      const jar = new descartes.Jar();
      this.startSpy = jar.probe('containerToStart.start');
      this.stopSpy = jar.probe('containerToStop.stop');
      this.restartSpy = jar.probe('containerToStop.start');
      this.logSpy = jar.sensor('log.message');
      this.stageSpy = jar.sensor('log.stage');
    });

    it("should do things in the right order", co.wrap(function*(){
      stopBeforeStart({stop: this.stopSpy}, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

      yield this.logSpy.called(descartes.withArgs('Stopping previous container'));

      yield this.stopSpy.called();

      yield this.logSpy.called(descartes.withArgs('Container stopped'));

      yield this.stageSpy.called();

      yield this.logSpy.called(descartes.withArgs('Starting new container'));

      yield this.startSpy.called();

      yield this.logSpy.called(descartes.withArgs('Container started'));
    }));

    describe("without a container to stop", function(){
      it("should not attempt to stop it", co.wrap(function*(){
        stopBeforeStart(null, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

        yield this.logSpy.called(descartes.withArgs('No container to stop'));

        yield this.stageSpy.called();

        yield this.logSpy.called(descartes.withArgs('Starting new container'));

        yield this.startSpy.called();

        yield this.logSpy.called(descartes.withArgs('Container started'));
      }));

      describe("and starting fails", function(){
        it("should not attempt to restart it", co.wrap(function*(){
          const result = stopBeforeStart(null, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

          yield this.logSpy.called(descartes.withArgs('No container to stop'));

          yield this.stageSpy.called();

          yield this.logSpy.called(descartes.withArgs('Starting new container'));

          this.startSpy.rejects(new Error());
          yield this.startSpy.called();

          yield this.logSpy.called(descartes.withArgs('Could not start new container'));

          try{
            yield result;
          }catch(e){
            e.should.be.a('Error');
          }
        }));
      });
    });

    describe("and stopping fails", function(){
      it("should abort", co.wrap(function*(){
        const result = stopBeforeStart({stop: this.stopSpy}, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

        yield this.logSpy.called(descartes.withArgs('Stopping previous container'));

        this.stopSpy.rejects(new Error());
        yield this.stopSpy.called();

        try{
          yield result;
        }catch(e){
          e.should.be.a('Error');
        }
      }));
    });

    describe("and starting fails", function(){
      it("should attempt to restart the stop container", co.wrap(function*(){
        const result = stopBeforeStart({stop: this.stopSpy, start: this.restartSpy}, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

        yield this.logSpy.called(descartes.withArgs('Stopping previous container'));

        yield this.stopSpy.called();

        yield this.logSpy.called(descartes.withArgs('Container stopped'));

        yield this.stageSpy.called();

        yield this.logSpy.called(descartes.withArgs('Starting new container'));

        this.startSpy.rejects(new Error());
        yield this.startSpy.called();

        yield this.logSpy.called(descartes.withArgs('Could not start new container'));

        yield this.logSpy.called();

        yield this.logSpy.called(descartes.withArgs('Attempting to rollback'));

        yield this.logSpy.called(descartes.withArgs('Starting previous container'));

        yield this.restartSpy.called();

        yield this.logSpy.called(descartes.withArgs('Previous container started'));

        try{
          yield result;
        }catch(e){
          e.should.be.a('Error');
        }
      }));
    });

    describe("and restarting fails", function(){
      it("should attempt to restart the stop container", co.wrap(function*(){
        const result = stopBeforeStart({stop: this.stopSpy, start: this.restartSpy}, {start: this.startSpy}, {message: this.logSpy, stage: this.stageSpy});

        yield this.logSpy.called(descartes.withArgs('Stopping previous container'));

        yield this.stopSpy.called();

        yield this.logSpy.called(descartes.withArgs('Container stopped'));

        yield this.stageSpy.called();

        yield this.logSpy.called(descartes.withArgs('Starting new container'));

        this.startSpy.rejects(new Error());
        yield this.startSpy.called();

        yield this.logSpy.called(descartes.withArgs('Could not start new container'));

        yield this.logSpy.called();

        yield this.logSpy.called(descartes.withArgs('Attempting to rollback'));

        yield this.logSpy.called(descartes.withArgs('Starting previous container'));

        this.restartSpy.rejects(new Error());
        yield this.restartSpy.called();

        yield this.logSpy.called(descartes.withArgs('Failed to rollback to previous container'));

        yield this.logSpy.called();

        try{
          yield result;
        }catch(e){
          e.should.be.a('Error');
          e.innerException.should.be.an('Error');
        }
      }));
    });
  });
});