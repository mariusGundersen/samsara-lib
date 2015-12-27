'use strict'
const Docker = require('dockerode-promise');
const getNonSpiritContainers = require('./src/getNonSpiritContainers');
const getSpirits = require('./src/getSpirits');
const Spirit = require('./src/Spirit');
const createSpirit = require('./src/createSpirit');
const upgrade = require('./src/upgrade');
const prettifyLogs = require('./src/util/prettifyLogs')

module.exports = function(options){
  options = options || {};

  var docker = options.docker || new Docker(options.dockerConfig);

  return {
    spirits(){
      return getSpirits(docker);
    },
    spirit(name){
      return new Spirit(name, docker);
    },
    createSpirit(name, image, tag){
      return createSpirit(name, image, tag);
    },
    containers(){
      return getNonSpiritContainers(docker);
    },
    container(id){
      const container = docker.getContainer(id);
      container.prettyLogs = (html, options) => container.logs(options).then(logs => logs.pipe(prettifyLogs({html:html})));
      return container;
    },
    upgrade(){
      return upgrade();
    }
  };
};