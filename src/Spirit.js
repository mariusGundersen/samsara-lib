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
  get status(){
    return this.docker.listContainers({
      filters: JSON.stringify({
        label:[
          "samsara.spirit.life",
          "samsara.spirit.name="+this.name
        ],
        status: ['running']
      })
    }).then(containers => containers.length > 0 ? 'running' : 'stopped');
  }
  get config(){
    return fs.readFile(pathTo.configJson(this.name))
    .then(result => JSON.parse(result));
  }
  get isDeploying(){
    return fs.exists(pathTo.deployLock(this.name));
  }
  get lives(){
    const life = this.life.bind(this);//oh V8...
    return getSpiritLives(this.name, this.docker)
    .then(lives => lives.map(life));
  }
  life(life){
    return new Life(this.name, life, this.docker);
  }
};