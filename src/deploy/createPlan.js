module.exports = {
  deploy(config){
    return ['pull', 'create']
    .concat(startStop(config.deploymentMethod))
    .concat(cleanup(config.cleanupLimit))
    .concat(['done']);
  },
  reincarnate(config){
    return startStop(config.deploymentMethod)
    .concat(['done']);
  }
};

function cleanup(cleanupLimit){
  return cleanupLimit > 0 ? ['cleanup'] : [];
}

function startStop(deploymentMethod){
  return deploymentMethod === 'stop-before-start'
    ? ['stop', 'start']
    : ['start', 'stop'];
}