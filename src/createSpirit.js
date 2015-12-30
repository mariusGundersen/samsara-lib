const co = require('co');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');
const yaml = require('js-yaml');
const pathTo = require('./paths');

module.exports = co.wrap(function *(name, image, tag){
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

  yield mkdirp(pathTo.spirit(name));
  yield mkdirp(pathTo.spiritLives(name));
  yield fs.writeFile(pathTo.spiritContainerConfig(name), yaml.safeDump({[name]:containerConfig}));
  yield fs.writeFile(pathTo.spiritSettingsJson(name), JSON.stringify(spiritSettings, null, '  '));
});
