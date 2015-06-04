const fs = require('fs-promise');
const co = require('co');
const path = require('path');
const p = require('./paths');

module.exports = function Spirit(name){
  this.name = name;
  this.config = co.wrap(function*(){
    const result = yield fs.readFile(path.join(p.CONFIG_SPIRITS, name, p.CONFIG_JSON));
    return JSON.parse(result);
  }),
  this.isDeploying = function(){
    return fs.exists(path.join(p.CONFIG_SPIRITS, name, p.DEPLOY_LOCK));
  }
};