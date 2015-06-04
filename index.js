var Enumerable = require('enumerable-component');

module.exports = function(options){
  
  
  return {
    spirits: function(){
      return Enumerable([]);
    },
    spirit: function(name){
      return {};
    },
    createSpirit: function(name, image, tag){
      return true;
    }
  };
};