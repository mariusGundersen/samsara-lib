const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');

module.exports = co.wrap(function*(docker){
  const containers = yield docker.listContainers({
    all: true, 
    filters: '{"label":["samsara.spirit.name", "samsara.spirit.life"]}'
  });
  
  const files = yield fs.readdir(pathTo.spirits());
  const directories = yield files.filter(name => isDirectory(pathTo.spirit(name)));
  
  return directories
    .concat(containers
      .map(container => container.Labels['samsara.spirit.name'])
      .filter(container => directories.indexOf(container) === -1)
    ).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
});


function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}