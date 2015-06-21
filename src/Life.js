'use strict'

const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');
const getSpiritLives = require('./getSpiritLives');

module.exports = class Life{
  constructor(name, life, docker){
    this.name = name;
    this.life = life;
    Object.defineProperty(this, 'docker', {value:docker});
  }
  *config(){
    const result = yield fs.readFile(pathTo.spiritLifeConfig(this.name, this.life));
    return JSON.parse(result);
  }
};