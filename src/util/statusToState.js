module.exports = function statusToState(status){
  if(status === 'Dead'){
    return module.exports.DEAD;
  }
  if(status === 'Created'){
    return module.exports.CREATED;
  }
  if(/^Restarting/.test(status)){
    return module.exports.RESTARTING;
  }
  if(/^Up .* \(Paused\)$/.test(status)){
    return module.exports.PAUSED;
  }
  if(/^Up/.test(status)){
    return module.exports.RUNNING;
  }
  return module.exports.EXITED;
};

module.exports.PAUSED = 'paused';
module.exports.RESTARTING = 'restarting';
module.exports.RUNNING = 'running';
module.exports.DEAD = 'dead';
module.exports.CREATED = 'created';
module.exports.EXITED = 'exited';
