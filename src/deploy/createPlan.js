module.exports = {
  deploy(config){
    return spread(function*(){
      yield 'pull';
      yield 'create';
      if(config.deploymentMethod === 'stop-before-start'){
        yield 'stop';
        yield 'start';
      }else{
        yield 'start';
        yield 'stop';
      }
      if(config.cleanupLimit > 0){
        yield 'cleanup';
      }
      yield 'done';
    });
  },
  reincarnate(config){
    return spread(function*(){
      if(config.deploymentMethod === 'stop-before-start'){
        yield 'stop';
        yield 'start';
      }else{
        yield 'start';
        yield 'stop';
      }
      yield 'done';
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