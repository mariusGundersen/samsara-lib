const fs = require('fs-promise');
const co = require('co');
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
  
  const files = yield fs.readdir(pathTo.spiritLives(name));
  const directories = yield files.filter(life => isDirectory(pathTo.life(name, life)));
  
  return directories
    .concat(containers
      .map(container => container.Labels['samsara.spirit.life'])
      .filter(container => directories.indexOf(container) === -1)
    ).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
});

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}