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
  get status(){
    return this.docker.listContainers({
      filters: JSON.stringify({
        label:[
          `samsara.spirit.life=${this.life}`,
          `samsara.spirit.name=${this.name}`
        ],
        status: ['running']
      })
    }).then(containers =>
      containers.length > 0
      ? Life.STATUS_ALIVE
      : Life.STATUS_DEAD);
  }
  get uptime(){
    return this.docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label:[
          `samsara.spirit.life=${this.life}`,
          `samsara.spirit.name=${this.name}`
        ]
      })
    }).then(containers => containers.map(container => /^(Exited\s\(\d+\)\s|^Up\s)(.*)/.exec(container.Status)))
    .then(matches => matches.filter(match => match))
    .then(matches => matches.map(match => match[2])[0] || ' ');
  }
  get containerConfig(){
    return fs.readFile(pathTo.spiritLifeContainerConfig(this.name, this.life));
  }
  get container(){
    return this.docker.listContainers({
      all: true,
      filters: JSON.stringify({
        'label':[
          `samsara.spirit.life=${this.life}`,
          `samsara.spirit.name=${this.name}`
        ]
      })
    }).then(function(result){
      if(result.length){
        return this.docker.getContainer(result[0].Id);
      }else{
        throw new Error(`Container for spirit ${this.name} (${this.life}) doesn't exist`);
      }
    }.bind(this));
  }
};

module.exports.STATUS_ALIVE = 'running';
module.exports.STATUS_DEAD = 'stopped';