module.exports = function(options){
  
  
  return {
    spirits: function(){
      return [];
    },
    spirit: function(name){
      return {};
    },
    createSpirit: function(name, image, tag){
      return true;
    }
  };
};