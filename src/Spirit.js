'use strict'

const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');

module.exports = class Spirit{
  constructor(name){
    this.name = name;
  }
  *config(){
    const result = yield fs.readFile(pathTo.configJson(name));
    return JSON.parse(result);
  }
  isDeploying(){
    return fs.exists(pathTo.deployLock(name));
  }
};