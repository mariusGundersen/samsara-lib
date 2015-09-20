const co = require('co');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');
const pathTo = require('./paths');

module.exports = co.wrap(function *(name, image, tag){
  const config = {
    name: name,
    image: image,
    tag: tag,
    deploymentMethod: 'start-before-stop',
    cleanupLimit: 10,
    description: '',
    url: '',
    webhook: {
      enable: false,
      secret: ''
    },
    raw: {},
    env: {},
    links: {},
    ports: {},
    volumes: {},
    volumesFrom: []
  };
  
  yield mkdirp(pathTo.spirit(name));
  yield mkdirp(pathTo.spiritLives(name));
  yield fs.writeFile(pathTo.configJson(name), JSON.stringify(config, null, '  '));
});
