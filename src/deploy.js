import createLogger from './deploy/createLogger';
import {deploy as deployPlan} from './deploy/createPlan';
import {lock, unlock} from './deploy/deployLock';
import pull from './deploy/pull';
import createContainerConfig from './deploy/createContainerConfig';
import startBeforeStop from './deploy/startBeforeStop';
import stopBeforeStart from './deploy/stopBeforeStart';
import cleanupOldContainers from './deploy/cleanupOldContainers';
import Spirit from './Spirit';

export default function(spirit, docker){
  const log = createLogger(spirit.name);
  deploy(spirit, docker, log);
  return log.eventEmitter;
};

async function deploy(spirit, docker, log){
  const containerConfig = await spirit.containerConfig;
  const spiritSettings = await spirit.settings;
  const latestLife = await spirit.latestLife;
  const currentLife = await spirit.currentLife;
  const nextLife = getNextLife(latestLife);
  const plan = deployPlan(spiritSettings);

  try{
    await lock(spirit.name);
    log.start(nextLife, plan, containerConfig);
    log.message('Deploy lock gained');
  }catch(e){
    return;
  }

  try{
    log.stage();
    await pull(containerConfig.image+':'+containerConfig.tag, docker, log.message);

    log.stage();
    log.message('Creating config');
    const dockerConfig = await createContainerConfig(spirit.name, nextLife, containerConfig, name => {
      return new Spirit(name, docker)
    });
    log.message('Config created');
    log.message('Creating container');
    const containerToStart = await docker.createContainer(dockerConfig);
    const containerToStop = await getContainerToStop(currentLife);
    log.message(`Container ${containerToStart.id} created`);

    log.stage();
    if(spiritSettings.deploymentMethod === 'stop-before-start'){
      await stopBeforeStart(containerToStop, containerToStart, log);
    }else{
      await startBeforeStop(containerToStart, containerToStop, log);
    }

    if(spiritSettings.cleanupLimit > 0){
      log.stage();
      await cleanupOldContainers(await spirit.lives, nextLife - spiritSettings.cleanupLimit, docker, log.message);
    }

    log.stop();
  }catch(e){
    log.message(e);
    log.stop(e);
  }finally{
    await unlock(spirit.name);
  }
};

function getNextLife(latestLife){
  const life = (latestLife || {life:0}).life || 0;
  return life*1 + 1;
}

function getContainerToStop(life){
  return life ? life.container : Promise.resolve(null);
}
