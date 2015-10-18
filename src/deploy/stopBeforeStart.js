const co = require('co');

module.exports = co.wrap(function *stopBeforeStart(containerToStop, containerToStart, log){
  if(containerToStop){
    log('Stopping previous container');
    yield containerToStop.stop();
    log('Container stopped');
  }
  
  try{
    log('Starting new container')
    yield containerToStart.start();
    log('Container started');
  }catch(e){
    log('Could not start new container');
    if(containerToStop){
      log(e);
      log('Attempting to rollback');
      try{
        log('Starting previous container');
        yield containerToStop.start();
        log('Previous container started');
      }catch(innerException){
        log('Failed to rollback to previous container');
        log(innerException);
        e.innerException = innerException;
      }
    }
    throw e;
  }
});