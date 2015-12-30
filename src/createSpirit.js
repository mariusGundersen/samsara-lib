const co = require('co');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');
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
      secret: ''
    }
  };

  const containerConfig = {
    image: image,
    tag: tag,
    raw: {},
    env: {},
    links: {},
    ports: {},
    volumes: {},
    volumesFrom: []
  };

  yield mkdirp(pathTo.spirit(name));
  yield mkdirp(pathTo.spiritLives(name));
  yield fs.writeFile(pathTo.containerConfigJson(name), JSON.stringify(containerConfig, null, '  '));
  yield fs.writeFile(pathTo.settingsJson(name), JSON.stringify(spiritSettings, null, '  '));
});
