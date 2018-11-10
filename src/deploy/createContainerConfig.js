export default async function(name, life, containerConfig, getSpirit){
  const links = await makeLinks(getSpirit, containerConfig.links);
  const volumesFrom = await makeVolumesFrom(getSpirit, containerConfig.volumesFrom);

  return {
    Image: containerConfig.image+':'+containerConfig.tag,
    name: name + '_v' + life,
    Env: makeEnv(containerConfig.environment),
    ExposedPorts: makeExposedPorts(containerConfig.ports),
    Volumes: makeVolumes(containerConfig.volumes),
    Labels: makeLabels(containerConfig.labels, name, life),
    HostConfig: {
      Links: links,
      Binds: makeBinds(containerConfig.config),
      PortBindings: makePortBindings(containerConfig.ports),
      VolumesFrom: volumesFrom,
      RestartPolicy: makeRestartPolicy(containerConfig.restartPolicy)
    }
  };
};

function makeExposedPorts(ports){
  return (ports || [])
  .reduce(function(result, port){
    const protocol = (port.tcp && port.udp ? 'tcpudp' :
      port.tcp ? 'tcp' :
      port.udp ? 'udp' :
      '');
    result[`${port.containerPort}/${protocol}`] = {}
    return result;
  }, {});
}

function makeEnv(environment){
  return environment
    .map(function(env){
      return env.key+'='+env.value;
    });
}

function makeVolumes(volumes){
  return (volumes || [])
    .reduce(function(result, volume){
      result[volume.containerPath] = {};
      return result;
    }, {});
}

function makeBinds(config){
  return (config.volumes || []);
}

function makePortBindings(ports){
  return (ports || [])
  .reduce(function(result, port){
    const protocol = (port.tcp && port.udp ? 'tcpudp' :
      port.tcp ? 'tcp' :
      port.udp ? 'udp' :
      '');
    result[`${port.containerPort}/${protocol}`] = (
      port.hostIp && port.hostPort ? [{"HostPort": port.hostPort, "HostIp": port.hostIp}] :
      port.hostPort ? [{"HostPort": port.hostPort}] :
      []);
    return result;
  }, {});
}

function makeLinks(getSpirit, links){
  return Promise.all((links || [])
  .map(function(link){
    if(link.spirit){
      return getCurrentLifeContainerId(getSpirit, link.spirit)
        .then(id => id +':'+ link.alias)
        .catch(e => {throw new Error(`Could not link to ${link.spirit}. Theres no running versions of that spirit`)});
    }else{
      return link.container+':'+link.alias;
    }
  }));
}

function makeVolumesFrom(getSpirit, volumesFrom){
  return Promise.all((volumesFrom || [])
  .map(function(volumeFrom){
    if(volumeFrom.spirit){
      return getCurrentLifeContainerId(getSpirit, volumeFrom.spirit)
        .then(id => id + (volumeFrom.readOnly ? ':ro' : ''))
        .catch(e => {throw new Error(`Could not get volumes from ${volumeFrom.spirit}. Theres no running versions of that spirit`)});
    }else{
      return volumeFrom.container + (volumeFrom.readOnly ? ':ro' : '');
    }
  }));
}

function makeLabels(labels, name, life){
  return {
    ...(labels.reduce((obj, entry) => ({...obj, [entry.key]: entry.value||''}), {})),
    'samsara.spirit.name': name,
    'samsara.spirit.life': life.toString()
  };
}

function getCurrentLifeContainerId(getSpirit, name){
  return getSpirit(name).currentLife
  .then(life => life.container)
  .then(container => container.id);
}

function makeRestartPolicy(restartPolicy){
  return {
    Name: restartPolicy || "",
    MaximumRetryCount: restartPolicy == 'on-failure' ? 3 : 0
  };
}