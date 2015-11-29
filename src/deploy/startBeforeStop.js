const co = require('co');

module.exports = co.wrap(function *(containerToStart, containerToStop, log){
  log('Starting new container')
  yield containerToStart.start();
  log('Container started');
  if(containerToStop && 'stop' in containerToStop){
    log('Waiting 5 seconds');
    yield delay(5000);
    log('Waited 5 seconds');
    log('Stopping previous container');
    yield containerToStop.stop();
    log('Container stopped');
  }
});

function delay(ms){
  return new Promise(function(resolve){
    setTimeout(resolve, ms);
  });
}