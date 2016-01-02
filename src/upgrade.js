'use strict'
const co = require('co');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');

const ContainerConfig = require('./ContainerConfig');
const pathTo = require('./paths');

module.exports = co.wrap(function *(){
  //init
  yield mkdirp(pathTo.spirits());

  //upgrade from json to yaml
  const files = yield fs.readdir(pathTo.spirits());
  const spirits = yield filterAsync(files, name => isDirectory(pathTo.spirit(name)));
  yield Promise.all(spirits.map(co.wrap(function *(spirit){
    const settingsExists = yield isFile(pathTo.spiritSettingsJson(spirit));
    const yamlExists = yield isFile(pathTo.spiritContainerConfig(spirit));
    const jsonExists = yield isFile(pathTo.spiritContainerConfigJson(spirit));
    if(jsonExists){
      const json = yield fs.readFile(pathTo.spiritContainerConfigJson(spirit), 'utf8');
      const config = JSON.parse(json);

      if(!settingsExists){
        const settings = createSettings(spirit, config);
        yield fs.writeFile(pathTo.spiritSettingsJson(spirit), JSON.stringify(settings, null, '  '));
      }

      if(!yamlExists){
        console.log('writing yaml for ', spirit);
        const yamlConfig = createYamlConfig(spirit, config);
        yield yamlConfig.save();
      }
    }
    const files = yield fs.readdir(pathTo.spiritLives(spirit));
    const lives = yield filterAsync(files, life => isDirectory(pathTo.spiritLife(spirit, life)));
    yield Promise.all(lives.map(co.wrap(function *(life){
      const yamlExists = yield isFile(pathTo.spiritLifeContainerConfig(spirit, life));
      const jsonExists = yield isFile(pathTo.spiritLifeContainerConfigJson(spirit, life));
      if(!yamlExists && jsonExists){
        const json = yield fs.readFile(pathTo.spiritLifeContainerConfigJson(spirit, life), 'utf8');
        const config = JSON.parse(json);
        const yamlConfig = createYamlConfig(spirit, config);
        yield yamlConfig.saveLife(life);
      }
    })));
  })));
});

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory(), e => false);
}

function isFile(path){
  return fs.stat(path).then(stat => stat.isFile(), e => false);
}

function filterAsync(list, test){
  return Promise.all(list
    .map(value => test(value).then(include => ({value: value, include: include}))))
    .then(list => list
      .filter(directory => directory.include)
      .map(directory => directory.value));
}

function createYamlConfig(name, config){
  const yamlConfig = new ContainerConfig(name);
  yamlConfig.image = config.image;
  yamlConfig.tag = config.tag;
  yamlConfig.environment = Object.keys(config.env || {})
    .map(key => ({
      key: key,
      value: config.env[key]
    }));
  yamlConfig.volumes = Object.keys(config.volumes || {})
    .map(containerPath => ({
      containerPath: containerPath,
      hostPath: config.volumes[containerPath].hostPath,
      readOnly: config.volumes[containerPath].readOnly
    }));
  yamlConfig.ports = Object.keys(config.ports || {})
    .map(hostPort => ({
      hostPort: hostPort,
      containerPort: config.ports[hostPort].containerPort,
      hostIp: config.ports[hostPort].hostIp
    }));
  yamlConfig.links = Object.keys(config.links || {})
    .map(alias => ({
      alias: alias,
      spirit: config.links[alias].spirit || '',
      container: config.links[alias].container || ''
    }));
  yamlConfig.volumesFrom = (config.volumesFrom || [])
    .map(entry => ({
      spirit: entry.spirit || '',
      container: entry.container || '',
      readOnly: entry.readOnly
    }));
  return yamlConfig;
}

function createSettings(name, config){
  return {
    name: name,
    deploymentMethod: config.deploymentMethod,
    cleanupLimit: config.cleanupLimit,
    description: config.description,
    url: config.url,
    webhook: {
      enable: config.webhook.enable,
      secret: config.webhook.secret,
      matchTag: config.webhook.matchTag
    }
  };
}