'use strict'

const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');
const getSpiritLives = require('./getSpiritLives');
const stream = require('stream');
const prettifyLogs = require('./util/prettifyLogs');
const statusToState = require('./util/statusToState');

module.exports = class Life{
  constructor(name, life, docker){
    this.name = name;
    this.life = life;
    this._container = undefined;
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
  get state(){
    return this.docker.listContainers({
      filters: JSON.stringify({
        all: true,
        label:[
          `samsara.spirit.life=${this.life}`,
          `samsara.spirit.name=${this.name}`
        ]
      })
    }).then(containers =>
      containers.length == 0
      ? statusToState.DEAD
      : statusToState(containers[0].Status));
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
    return fs.readFile(pathTo.spiritLifeContainerConfig(this.name, this.life), 'utf8');
  }
  get deployLog(){
    return fs.readFile(pathTo.spiritLifeDeployLog(this.name, this.life), 'utf8');
  }
  containerLog(html, options){
    return this.container
      .then(container => container.logs(options))
      .then(logs => logs.pipe(prettifyLogs({html: !!html})))
      .catch(e => new stream.Readable({read: function(n){ this.push(null) }}));
  }
  get inspect(){
    return this.container
      .then(container => container.inspect())
      .catch(e => null);
  }
  get container(){
    if(this._container !== undefined){
      return Promise.resolve(this._container);
    }

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
        return this._container = this.docker.getContainer(result[0].Id);
      }else{
        return this._container = null;
      }
    }.bind(this));
  }
};

module.exports.STATUS_ALIVE = 'running';
module.exports.STATUS_DEAD = 'stopped';