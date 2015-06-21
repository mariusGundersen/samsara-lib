'use strict'
const Docker = require('dockerode-promise');
const Enumerable = require('enumerable-component');

const getSpiritNames = require('./src/getSpiritNames');
const Spirit = require('./src/Spirit');

module.exports = function(options){
  options = options || {};
  
  var docker = options.docker || new Docker(options.dockerConfig);
  
  return {
    spirits(){
      return getSpiritNames(docker).then(names =>
        Enumerable(names.map(name => new Spirit(name, docker)))
      );
    },
    spirit(name){
      return new Spirit(name, docker);
    },
    createSpirit(name, image, tag){
      return true;
    }
  };
};