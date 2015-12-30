const co = require('co');

module.exports = co.wrap(function*(name, life, containerConfig, getSpirit){
  const links = yield makeLinks(getSpirit, containerConfig.links);
  const volumesFrom = yield makeVolumesFrom(getSpirit, containerConfig.volumes_from);

  return {
    Image: containerConfig.image,
    name: name + '_v' + life,
    Env: makeEnv(containerConfig.environment),
    Volumes: makeVolumes(containerConfig.volumes),
    Labels: makeLabels(name, life),
    HostConfig: {
      Links: links,
      Binds: makeBinds(containerConfig.volumes),
      PortBindings: makePortBindings(containerConfig.ports),
      VolumesFrom: volumesFrom
    }
  };
});

function makeEnv(environment){
  if(Array.isArray(environment)) return environment;

  return Object.keys(environment || {})
  .map(function(name){
    return name+'='+environment[name];
  });
}

function makeVolumes(volumes){
  return (volumes || [])
  .reduce(function(result, volume){
    const parts = volume.split(':');
    const containerPath = parts.length == 1 ? parts[0] : parts[1];
    result[containerPath] = {};
    return result;
  }, {});
}

function makeBinds(volumes){
  return (volumes || []);
}

function makePortBindings(ports){
  return (ports || [])
  .reduce(function(result, port){
    const parts = port.split(':');
    if(parts.length == 1){
      result[parts[0]+'/tcp'] = [];
    }else if(parts.length == 2){
      result[parts[1] + '/tcp'] = [{"HostPort": parts[0]}];
    }else if(parts.length == 3){
      result[parts[2]+'/tcp'] = [{"HostPort": parts[1], "HostIp": parts[0]}];
    }
    return result;
  }, {});
}

function makeLinks(getSpirit, links){
  return Promise.all((links || [])
  .map(function(link){
    const parts = link.split(':');
    const match = /^spirit\(([a-zA-Z0-9_\.-]+)\)$/.exec(parts[0]);
    if(match){
      return getCurrentLifeContainerId(getSpirit, match[1])
        .then(id => id +':'+ (parts[1] || match[1]))
        .catch(e => {throw new Error(`Could not link to ${match[1]}. Theres no running versions of that spirit`)});
    }else{
      return link;
    }
  }));
}

function makeVolumesFrom(getSpirit, volumesFrom){
  return Promise.all((volumesFrom || [])
  .map(function(volumeFrom){
    const parts = volumeFrom.split(':');
    const match = /^spirit\(([a-zA-Z0-9_\.-]+)\)$/.exec(parts[0]);
    if(match){
      return getCurrentLifeContainerId(getSpirit, match[1])
        .then(id => id + (parts.length > 1 ? ':'+parts[1] : ''))
        .catch(e => {throw new Error(`Could not get volumes from ${match[1]}. Theres no running versions of that spirit`)});
    }else{
      return volumeFrom;
    }
  }));
}

function makeLabels(name, life){
  return {
    'samsara.spirit.name': name,
    'samsara.spirit.life': life.toString()
  };
}

function getCurrentLifeContainerId(getSpirit, name){
  return getSpirit(name).currentLife
  .then(life => life.container)
  .then(container => container.id);
}