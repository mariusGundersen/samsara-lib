const createLogger = require('./createLogger');

describe('createLogger', function(){
  it('should be a function', function(){
    createLogger.should.be.a('Function');
    createLogger.length.should.equal(1);
  });

  describe('when called', function(){
    beforeEach(function(){
      this.logger = createLogger('something');
    });

    it('should have an eventEmitter', function(){
      this.logger.eventEmitter.should.be.defined;
    });

    it('should emit the right plan', function(done){
      this.logger.eventEmitter.on('plan', function(event){
        event.spirit.should.equal('something');
        event.plan.should.deep.equal(['test', 'done']);
        done();
      });

      this.logger.plan(['test', 'done']);
    });

    it('should emit the right message', function(done){
      this.logger.eventEmitter.on('message', function(event){
        event.spirit.should.equal('something');
        event.message.should.equal('hello');
        done();
      });

      this.logger.message('hello');
    });

    it('should emit the right stage', function(done){
      this.logger.eventEmitter.on('stage', function(event){
        event.spirit.should.equal('something');
        done();
      });

      this.logger.stage('hello');
    });
  });
});