const co = require('co');

module.exports = co.wrap(function *(containerToStart, containerToStop, log){
  log.message('Starting new container')
  yield containerToStart.start();
  log.message('Container started');

  log.stage();
  if(containerToStop && 'stop' in containerToStop){
    log.message('Waiting 5 seconds');
    yield delay(5000);
    log.message('Waited 5 seconds');
    log.message('Stopping previous container');
    yield containerToStop.stop();
    log.message('Container stopped');
  }else{
    log.message('No container to stop');
  }
});

function delay(ms){
  return new Promise(function(resolve){
    setTimeout(resolve, ms);
  });
}