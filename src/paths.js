'use strict'

const path = require('path');

const CONFIG_SPIRITS = 'config/spirits';
const DEPLOY_LOCK = 'deploy.lock';
const CONFIG_JSON = 'config.json';

module.exports = {
  configJson(name){
    return path.join(p.CONFIG_SPIRITS, name, p.CONFIG_JSON)
  },
  deployLock(name){
    return path.join(p.CONFIG_SPIRITS, name, p.DEPLOY_LOCK)
  }
};