'use strict'

const co = require('co');
const createLogger = require('./deploy/createLogger');
const createPlan = require('./deploy/createPlan');
const deployLock = require('./deploy/deployLock');
const startBeforeStop = require('./deploy/startBeforeStop');
const stopBeforeStart = require('./deploy/stopBeforeStart');

module.exports = function(spirit, life, docker){
  const log = createLogger(spirit.name);
  revive(spirit, life, docker, log);
  return log.eventEmitter;
};

const revive = co.wrap(function* (spirit, life, docker, log){
  const config = yield spirit.config;
  const currentLife = yield spirit.currentLife;
  const nextLife = spirit.life(life);
  const plan = createPlan.revive(config);
  log.start(life, plan, config);

  try{
    yield deployLock.lock(spirit.name);
    log.message('Deploy lock gained');
  }catch(e){
    log.message(e);
    log.stop(e);
    return;
  }

  try{
    log.stage();
    const containerToStart = yield nextLife.container;
    const containerToStop = yield getContainerToStop(currentLife);

    log.stage();
    if(config.deploymentMethod === 'stop-before-start'){
      yield stopBeforeStart(containerToStop, containerToStart, log);
    }else{
      yield startBeforeStop(containerToStart, containerToStop, log);
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
