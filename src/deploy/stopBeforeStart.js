const co = require('co');

module.exports = co.wrap(function *stopBeforeStart(containerToStop, containerToStart, log){
  if(containerToStop){
    log.message('Stopping previous container');
    yield containerToStop.stop();
    log.message(`Container ${containerToStop.id} stopped`);
  }else{
    log.message('No container to stop');
  }

  log.stage();

  try{
    log.message('Starting new container')
    yield containerToStart.start();
    log.message(`Container ${containerToStart.id} started`);
  }catch(e){
    log.message('Could not start new container');
    if(containerToStop){
      log.message(e);
      log.message('Attempting to rollback');
      try{
        log.message('Starting previous container');
        yield containerToStop.start();
        log.message('Previous container started');
      }catch(innerException){
        log.message('Failed to rollback to previous container');
        log.message(innerException);
        e.innerException = innerException;
      }
    }
    throw e;
  }
});