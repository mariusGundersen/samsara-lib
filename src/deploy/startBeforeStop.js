export default async function startBeforeStop(containerToStart, containerToStop, log){
  log.message('Starting new container')
  await containerToStart.start();
  log.message(`Container ${containerToStart.id} started`);

  log.stage();
  if(containerToStop && 'stop' in containerToStop){
    log.message('Waiting 5 seconds');
    await delay(5000);
    log.message('Waited 5 seconds');
    log.message('Stopping previous container');
    await containerToStop.stop();
    log.message(`Container ${containerToStop.id} stopped`);
  }else{
    log.message('No container to stop');
  }
};

function delay(ms){
  return new Promise(function(resolve){
    setTimeout(resolve, ms);
  });
}
