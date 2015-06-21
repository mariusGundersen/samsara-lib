'use strict'

const Enumerable = require('enumerable-component');

module.exports = function(options){  
  return {
    spirits(){
      return Enumerable([]);
    },
    spirit(name){
      return {};
    },
    createSpirit(name, image, tag){
      return true;
    }
  };
};