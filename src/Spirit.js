'use strict'

const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');
const getSpiritLives = require('./getSpiritLives');
const deploy = require('./deploy');
const revive = require('./revive');
const Life = require('./Life');
const fileLogger = require('./deploy/fileLogger');

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
    }).then(containers =>
      containers.length > 0
      ? Spirit.STATUS_ALIVE
      : Spirit.STATUS_DEAD);
  }
  get containerConfig(){
    return fs.readFile(pathTo.containerConfigJson(this.name))
    .then(result => JSON.parse(result));
  }
  mutateContainerConfig(mutator){
    return this.containerConfig
    .then(config => {
      mutator(config);
      return config;
    })
    .then(config => JSON.stringify(config, null, '  '))
    .then(json => fs.writeFile(pathTo.containerConfigJson(this.name), json));
  }
  get settings(){
    return fs.readFile(pathTo.settingsJson(this.name))
    .then(result => JSON.parse(result));
  }
  mutateSettings(mutator){
    return this.settings
    .then(settings => {
      mutator(settings);
      return settings;
    })
    .then(settings => JSON.stringify(settings, null, '  '))
    .then(json => fs.writeFile(pathTo.settingsJson(this.name), json));
  }
  get isDeploying(){
    return fs.exists(pathTo.deployLock(this.name));
  }
  get lives(){
    return getSpiritLives(this.name, this.docker)
    .then(lives => lives.map(life => this.life(life)));
  }
  get currentLife(){
    return this.lives.then(co.wrap(function *(lives){
      const tests = yield Promise.all(lives.map(life =>
        life.status.then(status => ({
          test: status == Life.STATUS_ALIVE,
          value: life
        }))
      ));
      const alives = tests
       .filter(temp => temp.test)
       .map(temp => temp.value);
      if(alives.length > 0){
        return alives[0];
      }else{
        return null;
      }
    }));
  }
  get latestLife(){
    return this.lives.then(lives => lives[lives.length - 1]);
  }
  life(life){
    return new Life(this.name, life, this.docker);
  }
  deploy(){
    const progress = deploy(this, this.docker);
    fileLogger(progress);
    return progress;
  }
  revive(life){
    return revive(this, life, this.docker);
  }
};

module.exports.STATUS_ALIVE = 'running';
module.exports.STATUS_DEAD = 'stopped';