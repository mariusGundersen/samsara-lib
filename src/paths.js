'use strict'

const path = require('path');

const CONFIG_SPIRITS = 'config/spirits';
const LIVES = 'lives';
const DEPLOY_LOCK = 'deploy.lock';
const CONTAINER_CONFIG_JSON = 'containerConfig.json';
const CONTAINER_CONFIG_YML = 'containerConfig.yml';
const SETTINGS_JSON = 'settings.json';
const DEPLOY_LOG = 'deploy.log';

module.exports = {
  spirits(){
    return CONFIG_SPIRITS;
  },
  spirit(name){
    return path.join(CONFIG_SPIRITS, name);
  },
  spiritContainerConfigJson(name){
    return path.join(CONFIG_SPIRITS, name, CONTAINER_CONFIG_JSON);
  },
  spiritContainerConfig(name){
    return path.join(CONFIG_SPIRITS, name, CONTAINER_CONFIG_YML);
  },
  spiritSettingsJson(name){
    return path.join(CONFIG_SPIRITS, name, SETTINGS_JSON);
  },
  spiritDeployLock(name){
    return path.join(CONFIG_SPIRITS, name, DEPLOY_LOCK);
  },
  spiritLives(name){
    return path.join(CONFIG_SPIRITS, name, LIVES);
  },
  life(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life);
  },
  spiritLifeContainerConfigJson(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life, CONTAINER_CONFIG_JSON);
  },
  spiritLifeContainerConfig(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life, CONTAINER_CONFIG_YML);
  },
  spiritLifeDeployLog(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life, DEPLOY_LOG);
  }
};