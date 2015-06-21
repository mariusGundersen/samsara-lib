'use strict'

const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');
const getSpiritLives = require('./getSpiritLives');
const Life = require('./Life');

module.exports = class Spirit{
  constructor(name, docker){
    this.name = name;
    Object.defineProperty(this, 'docker', {value:docker});
  }
  *config(){
    const result = yield fs.readFile(pathTo.configJson(this.name));
    return JSON.parse(result);
  }
  isDeploying(){
    return fs.exists(pathTo.deployLock(this.name));
  }
  *lives(){
    const lives = yield getSpiritLives(this.name, this.docker);
    return lives.map(life => new Life(this.name, life, this.docker));
  }
};