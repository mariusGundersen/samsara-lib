const extend = require('extend');
const co = require('co');

module.exports = co.wrap(function*(name, life, containerConfig, getSpirit){
  const links = yield makeLinks(getSpirit, containerConfig.links);
  const volumes = yield makeVolumesFrom(getSpirit, containerConfig.volumesFrom);

  return extend({
    Image: containerConfig.image+':'+containerConfig.tag,
    name: name + '_v' + life,
    Env: makeEnv(containerConfig.env),
    Volumes: makeVolumes(containerConfig.volumes),
    Labels: makeLabels(name, life),
    HostConfig: {
      Links: links,
      Binds: makeBinds(containerConfig.volumes),
      PortBindings: makePortBindings(containerConfig.ports),
      VolumesFrom: volumes
    }
  }, containerConfig.raw);
});

function makeEnv(env){
  return Object.keys(env || {})
  .map(function(name){
    return name+'='+env[name];
  });
}

function makeVolumes(volumes){
  return Object.keys(volumes || {})
  .reduce(function(result, containerPath){
    result[containerPath] = {};
    return result;
  }, {});
}

function makeBinds(volumes){
  return Object.keys(volumes || {})
  .map(function(containerPath){
    const volume = volumes[containerPath];
    if(typeof(volume) == 'string'){
      return volume+':'+containerPath;
    }else if(volume.hostPath == ''){
      return containerPath;
    }else if(volume.readOnly){
      return volume.hostPath+':'+containerPath+':ro';
    }else{
      return volume.hostPath+':'+containerPath;
    }
  });
}

function makePortBindings(ports){
  return Object.keys(ports || {})
  .reduce(function(result, hostPort){
    const port = ports[hostPort];
    if(typeof(port) == 'string'){
      result[port+'/tcp'] = [{"HostPort": hostPort}];
    }else{
      result[port.containerPort+'/'+(port.protocol||'tcp')] = [{"HostPort": hostPort, "HostIp": port.hostIp || ''}];
    }
    return result;
  }, {});
}

function makeLinks(getSpirit, links){
  return Promise.all(Object.keys(links || {})
  .map(function(name){
    const link = links[name];
    if(typeof(link) == 'string'){
      return link+':'+name;
    }else if('spirit' in link){
      return getCurrentLifeContainerId(getSpirit, link.spirit)
        .then(id => id +':'+ name)
        .catch(e => {throw new Error(`Could not link to ${link.spirit}. Theres no running versions of that spirit`)});
    }else if('container' in link){
      return link.container+':'+name;
    }
  }));
}

function makeVolumesFrom(getSpirit, spirits){
  return Promise.all((spirits || [])
  .map(function(spirit){
    return getCurrentLifeContainerId(getSpirit, spirit.spirit)
      .then(id => id+':'+(spirit.readOnly ? 'ro' : 'rw'))
      .catch(e => {throw new Error(`Could not get volumes from ${spirit.spirit}. Theres no running versions of that spirit`)});
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