const fs = require('fs-promise');
const co = require('co');
const mkdirp = require('mkdirp-promise');
const pathTo = require('./paths');

module.exports = co.wrap(function*(name, docker){
  const containers = yield docker.listContainers({
    all: true,
    filters: JSON.stringify({
      "label":[
        "samsara.spirit.life",
        "samsara.spirit.name="+name
      ]
    })
  });
  
  yield mkdirp(pathTo.spiritLives(name));
  
  const files = yield fs.readdir(pathTo.spiritLives(name));
  const directories = yield files.filter(life => isDirectory(pathTo.life(name, life)));
  
  return directories
    .concat(containers
      .map(container => container.Labels['samsara.spirit.life'])
      .filter(container => directories.indexOf(container) === -1)
    ).sort((a,b) => a*1 < b*1 ? -1 : a*1 > b*1 ? 1 : 0);
});

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}