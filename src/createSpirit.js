import fs from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import yaml from 'js-yaml';
import {spirit, spiritLives, spiritContainerConfig, spiritSettingsJson} from './paths';

export default async function(name, image, tag){
  const spiritSettings = {
    name: name,
    deploymentMethod: 'start-before-stop',
    cleanupLimit: 10,
    description: '',
    url: '',
    webhook: {
      enable: false,
      secret: '',
      matchTag: ''
    }
  };

  const containerConfig = {
    image: image+':'+tag
  };

  await mkdirp(spirit(name));
  await mkdirp(spiritLives(name));
  await fs.writeFile(spiritContainerConfig(name), yaml.safeDump({[name]:containerConfig}));
  await fs.writeFile(spiritSettingsJson(name), JSON.stringify(spiritSettings, null, '  '));
};
