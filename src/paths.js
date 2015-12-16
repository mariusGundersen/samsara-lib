'use strict'

const path = require('path');

const CONFIG_SPIRITS = 'config/spirits';
const LIVES = 'lives';
const DEPLOY_LOCK = 'deploy.lock';
const CONFIG_JSON = 'config.json';
const DEPLOY_LOG = 'deploy.log';

module.exports = {
  spirits(){
    return CONFIG_SPIRITS;
  },
  spirit(name){
    return path.join(CONFIG_SPIRITS, name);
  },
  configJson(name){
    return path.join(CONFIG_SPIRITS, name, CONFIG_JSON);
  },
  deployLock(name){
    return path.join(CONFIG_SPIRITS, name, DEPLOY_LOCK);
  },
  spiritLives(name){
    return path.join(CONFIG_SPIRITS, name, LIVES);
  },
  life(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life);
  },
  spiritLifeConfig(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life, CONFIG_JSON);
  },
  spiritLifeDeployLog(name, life){
    return path.join(CONFIG_SPIRITS, name, LIVES, life, DEPLOY_LOG);
  }
};