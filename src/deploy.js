'use strict'

const co = require('co');
const createLogger = require('./deploy/createLogger');
const createPlan = require('./deploy/createPlan');
const deployLock = require('./deploy/deployLock');
const pull = require('./deploy/pull');
const createContainerConfig = require('./deploy/createContainerConfig');
const startBeforeStop = require('./deploy/startBeforeStop');
const stopBeforeStart = require('./deploy/stopBeforeStart');
const cleanupOldContainers = require('./deploy/cleanupOldContainers');
const Spirit = require('./Spirit');

module.exports = function(spirit, docker){
  const log = createLogger(spirit.name);
  deploy(spirit, docker, log);
  return log.eventEmitter;
};

const deploy = co.wrap(function* (spirit, docker, log){
  const containerConfig = yield spirit.containerConfig;
  const spiritSettings = yield spirit.settings;
  const latestLife = yield spirit.latestLife;
  const currentLife = yield spirit.currentLife;
  const nextLife = getNextLife(latestLife);
  const plan = createPlan.deploy(spiritSettings);

  try{
    yield deployLock.lock(spirit.name);
    log.start(nextLife, plan, containerConfig);
    log.message('Deploy lock gained');
  }catch(e){
    return;
  }

  try{
    log.stage();
    yield pull(containerConfig.image, docker, log.message);

    log.stage();
    log.message('Creating config');
    const dockerConfig = yield createContainerConfig(spirit.name, nextLife, containerConfig, name => new Spirit(name, docker));
    log.message('Config created');
    log.message('Creating container');
    const containerToStart = yield docker.createContainer(dockerConfig);
    const containerToStop = yield getContainerToStop(currentLife);
    log.message('Container created');

    log.stage();
    if(spiritSettings.deploymentMethod === 'stop-before-start'){
      yield stopBeforeStart(containerToStop, containerToStart, log);
    }else{
      yield startBeforeStop(containerToStart, containerToStop, log);
    }

    if(spiritSettings.cleanupLimit > 0){
      log.stage();
      yield cleanupOldContainers(yield spirit.lives, nextLife - spiritSettings.cleanupLimit, docker, log.message);
    }

    log.stop();
  }catch(e){
    log.message(e);
    log.stop(e);
  }finally{
    yield deployLock.unlock(spirit.name);
  }
});

function getNextLife(latestLife){
  const life = (latestLife || {life:0}).life || 0;
  return life*1 + 1;
}

function getContainerToStop(life){
  return life ? life.container : Promise.resolve(null);
}
