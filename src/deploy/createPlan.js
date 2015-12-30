module.exports = {
  deploy(spiritSettings){
    return spread(function*(){
      yield 'pull';
      yield 'create';
      if(spiritSettings.deploymentMethod === 'stop-before-start'){
        yield 'stop';
        yield 'start';
      }else{
        yield 'start';
        yield 'stop';
      }
      if(spiritSettings.cleanupLimit > 0){
        yield 'cleanup';
      }
    });
  },
  revive(spiritSettings){
    return spread(function*(){
      if(spiritSettings.deploymentMethod === 'stop-before-start'){
        yield 'stop';
        yield 'start';
      }else{
        yield 'start';
        yield 'stop';
      }
    });
  }
};

function spread(iterator){
  'use strict'
  const result = [];
  for(let item of iterator()){
    result.push(item);
  }
  return result;
}