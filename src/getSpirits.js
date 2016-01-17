const fs = require('fs-promise');
const co = require('co');
const pathTo = require('./paths');
const statusToState = require('./util/statusToState');
const asyncArray = require('./util/asyncArray');

module.exports = co.wrap(function*(docker){
  const containers = yield docker.listContainers({
    all: true,
    filters: JSON.stringify({
      "label":[
        "samsara.spirit.life",
        "samsara.spirit.name"
      ]
    })
  });

  const directories = yield fs.readdir(pathTo.spirits())
    .then(asyncArray.filter(name => isDirectory(pathTo.spirit(name))));

  return yield Promise.all(directories
  .sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  .map(co.wrap(function*(name){
    const lives = yield getLives(name, containers);
    const currentLife = getCurrentLife(lives);
    const isDeploying = yield fs.stat(pathTo.spiritDeployLock(name)).then(stat => stat.isFile());
    if(isDeploying){
      currentLife.state = 'deploying';
    }
    return {
      name: name,
      lives: lives,
      state: currentLife.state,
      life: currentLife.life
    };
  })));
});

const getLives = co.wrap(function *(name, containers){
  const directories = yield fs.readdir(pathTo.spiritLives(name))
  .then(asyncArray.filter(life => isDirectory(pathTo.spiritLife(name, life))));

  const lives = containers
    .filter(container => container.Labels['samsara.spirit.name'] == name)
    .map(container => ({
      life: container.Labels['samsara.spirit.life'],
      state: statusToState(container.Status),
      uptime: (/^(Exited\s\(\d+\)\s|^Up\s)(.*)/.exec(container.Status) || [])[2] || ''
    }));

  return lives
    .concat(
      directories
      .filter(directory => lives.map(life => life.life*1).indexOf(directory*1) === -1)
      .map(directory => ({
        life: directory*1,
        state: statusToState.DEAD,
        uptime: ''
      }))
    ).sort((a,b) => a.life - b.life);
});

function getCurrentLife(lives){
  return lives.filter(life => life.state === statusToState.RUNNING).reverse()[0]
    || lives.map(x => x).reverse()[0]
    || {life: '?', state: statusToState.DEAD, uptime: ''};
}

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}