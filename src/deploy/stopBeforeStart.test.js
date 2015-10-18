const stopBeforeStart = require('./stopBeforeStart');
const sinon = require('sinon');
const co = require('co');

describe("stopBeforeStart", function(){
  it("should be a function", function(){
    stopBeforeStart.should.be.a('Function');
  });
  
  describe("when called", function(){
    beforeEach(function(){
      this.startSpy = sinon.stub().returns(Promise.resolve());
      this.stopSpy = sinon.stub().returns(Promise.resolve());
      this.logSpy = sinon.spy();
    });
    
    it("should do things in the right order", co.wrap(function*(){
            
      yield stopBeforeStart({stop: this.stopSpy}, {start: this.startSpy}, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Stopping previous container');
      
      this.stopSpy.should.have.been.calledOnce;
      
      this.logSpy.should.have.been.calledWith('Container stopped');
      
      this.logSpy.should.have.been.calledWith('Starting new container');
      
      this.startSpy.should.have.been.calledOnce;
      
      this.logSpy.should.have.been.calledWith('Container started');
    }));
    
    describe("without a container to stop", function(){
      it("should not attempt to stop it", co.wrap(function*(){

        yield stopBeforeStart(null, {start: this.startSpy}, this.logSpy);

        this.logSpy.should.not.have.been.calledWith('Stopping previous container');

        this.logSpy.should.not.have.been.calledWith('Container stopped');

        this.logSpy.should.have.been.calledWith('Starting new container');

        this.startSpy.should.have.been.calledOnce;

        this.logSpy.should.have.been.calledWith('Container started');
      }));
    
      describe("and starting fails", function(){
        
        beforeEach(function(){
          this.startSpy.returns(Promise.reject(new Error()));
        });

        it("should not attempt to restart it", co.wrap(function*(){

          try{
            yield stopBeforeStart(null, {start: this.startSpy}, this.logSpy);
          }catch(e){
            e.should.be.a('Error');
          }

          this.logSpy.should.not.have.been.calledWith('Stopping previous container');

          this.logSpy.should.not.have.been.calledWith('Container stopped');

          this.logSpy.should.have.been.calledWith('Starting new container');

          this.startSpy.should.have.been.calledOnce;

          this.logSpy.should.not.have.been.calledWith('Container started');

          this.logSpy.should.have.been.calledWith('Could not start new container');

          this.logSpy.should.not.have.been.calledWith('Attempting to rollback');
        }));
      });
    });
    
    describe("and stopping fails", function(){
      
      beforeEach(function(){
        this.stopSpy.returns(Promise.reject(new Error()));
      });
      
      it("should abort", co.wrap(function*(){
        
        try{
          yield stopBeforeStart({stop: this.stopSpy}, {start: this.startSpy}, this.logSpy);
        }catch(e){
          e.should.be.a('Error');
        }

        this.logSpy.should.have.been.calledWith('Stopping previous container');

        this.stopSpy.should.have.been.calledOnce;

        this.logSpy.should.not.have.been.calledWith('Container stopped');

        this.logSpy.should.not.have.been.calledWith('Starting new container');

        this.startSpy.should.not.have.been.calledOnce;

        this.logSpy.should.not.have.been.calledWith('Container started');
      }));
    });
    
    describe("and starting fails", function(){
      
      beforeEach(function(){
        this.startSpy.returns(Promise.reject(new Error()));
        this.restartSpy = sinon.stub().returns(Promise.resolve());
      });
      
      it("should attempt to restart the stop container", co.wrap(function*(){
        
        try{
          yield stopBeforeStart({stop: this.stopSpy, start: this.restartSpy}, {start: this.startSpy}, this.logSpy);
        }catch(e){
          e.should.be.a('Error');
        }

        this.logSpy.should.have.been.calledWith('Stopping previous container');

        this.stopSpy.should.have.been.calledOnce;

        this.logSpy.should.have.been.calledWith('Container stopped');

        this.logSpy.should.have.been.calledWith('Starting new container');

        this.startSpy.should.have.been.calledOnce;

        this.logSpy.should.not.have.been.calledWith('Container started');

        this.logSpy.should.have.been.calledWith('Could not start new container');

        this.logSpy.should.have.been.calledWith('Attempting to rollback');
        
        this.restartSpy.should.have.been.calledOnce;

        this.logSpy.should.have.been.calledWith('Starting previous container');

        this.logSpy.should.have.been.calledWith('Previous container started');
      }));
    });
    
    describe("and restarting fails", function(){
      
      beforeEach(function(){
        this.startSpy.returns(Promise.reject(new Error()));
        this.restartSpy = sinon.stub().returns(Promise.reject(new Error()));
      });

      it("should attempt to restart the stop container", co.wrap(function*(){

        try{
          yield stopBeforeStart({stop: this.stopSpy, start: this.restartSpy}, {start: this.startSpy}, this.logSpy);
        }catch(e){
          e.should.be.a('Error');
          e.innerException.should.be.an('Error');
        }

        this.logSpy.should.have.been.calledWith('Stopping previous container');

        this.stopSpy.should.have.been.calledOnce;

        this.logSpy.should.have.been.calledWith('Container stopped');

        this.logSpy.should.have.been.calledWith('Starting new container');

        this.startSpy.should.have.been.calledOnce;

        this.logSpy.should.not.have.been.calledWith('Container started');

        this.logSpy.should.have.been.calledWith('Could not start new container');

        this.logSpy.should.have.been.calledWith('Attempting to rollback');

        this.restartSpy.should.have.been.calledOnce;

        this.logSpy.should.have.been.calledWith('Starting previous container');

        this.logSpy.should.have.been.calledWith('Failed to rollback to previous container');
      }));
    });
  });
});