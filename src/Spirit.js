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
  config(){
    return fs.readFile(pathTo.configJson(this.name))
    .then(result => JSON.parse(result));
  }
  isDeploying(){
    return fs.exists(pathTo.deployLock(this.name));
  }
  lives(){
    return getSpiritLives(this.name, this.docker)
    .then(lives => lives.map(this.life));
  }
  life(life){
    return new Life(this.name, life, this.docker);
  }
};