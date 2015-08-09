'use strict'
const Docker = require('dockerode-promise');

const getSpiritNames = require('./src/getSpiritNames');
const Spirit = require('./src/Spirit');
const createSpirit = require('./src/createSpirit');
const createContainerConfig = require('./src/createContainerConfig');

module.exports = function(options){
  options = options || {};
  
  var docker = options.docker || new Docker(options.dockerConfig);
  
  return {
    spirits(){
      return getSpiritNames(docker)
        .then(names => names.map(name => new Spirit(name, docker)));
    },
    spirit(name){
      return new Spirit(name, docker);
    },
    createSpirit(name, image, tag){
      return createSpirit(name, image, tag);
    },
    createContainerConfig(name, life, config){
      return createContainerConfig(name, life, config, name => new Spirit(name, docker));
    }
  };
};