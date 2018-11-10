export function deploy(spiritSettings){
  return [...(function*(){
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
  })()];
};

export function revive(spiritSettings){
  return [...(function*(){
    if(spiritSettings.deploymentMethod === 'stop-before-start'){
      yield 'stop';
      yield 'start';
    }else{
      yield 'start';
      yield 'stop';
    }
  })()];
};
