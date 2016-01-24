import fs from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import ContainerConfig from './ContainerConfig';
import {spirits as spiritsDir, spirit, spiritSettingsJson, spiritContainerConfig, spiritContainerConfigJson, spiritLives, spiritLife, spiritLifeContainerConfig, spiritLifeContainerConfigJson} from './paths';

export default async function(){
  //init
  await mkdirp(spiritsDir());

  //upgrade from json to yaml
  const files = await fs.readdir(spiritsDir());
  const spirits = await filterAsync(files, name => isDirectory(spirit(name)));
  await Promise.all(spirits.map(async function(spirit){
    const settingsExists = await isFile(spiritSettingsJson(spirit));
    const yamlExists = await isFile(spiritContainerConfig(spirit));
    const jsonExists = await isFile(spiritContainerConfigJson(spirit));
    if(jsonExists){
      const json = await fs.readFile(spiritContainerConfigJson(spirit), 'utf8');
      const config = JSON.parse(json);

      if(!settingsExists){
        const settings = createSettings(spirit, config);
        await fs.writeFile(spiritSettingsJson(spirit), JSON.stringify(settings, null, '  '));
      }

      if(!yamlExists){
        console.log('writing yaml for ', spirit);
        const yamlConfig = createYamlConfig(spirit, config);
        await yamlConfig.save();
      }
    }
    const files = await fs.readdir(spiritLives(spirit));
    const lives = await filterAsync(files, life => isDirectory(spiritLife(spirit, life)));
    await Promise.all(lives.map(async function(life){
      const yamlExists = await isFile(spiritLifeContainerConfig(spirit, life));
      const jsonExists = await isFile(spiritLifeContainerConfigJson(spirit, life));
      if(!yamlExists && jsonExists){
        const json = await fs.readFile(spiritLifeContainerConfigJson(spirit, life), 'utf8');
        const config = JSON.parse(json);
        const yamlConfig = createYamlConfig(spirit, config);
        await yamlConfig.saveLife(life);
      }
    }));
  }));
};

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
