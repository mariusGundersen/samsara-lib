import fs from 'fs-promise';
import {spirits, spirit, spiritDeployLock, spiritLives, spiritLife} from './paths';
import statusToState, {RUNNING, DEAD} from './util/statusToState';
import {filter} from './util/asyncArray';

export default async function(docker){
  const containers = await docker.listContainers({
    all: true,
    filters: JSON.stringify({
      "label":[
        "samsara.spirit.life",
        "samsara.spirit.name"
      ]
    })
  });

  const directories = await fs.readdir(spirits())
    .then(filter(name => isDirectory(spirit(name))));

  return await Promise.all(directories
  .sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  .map(async function(name){
    const lives = await getLives(name, containers);
    const currentLife = getCurrentLife(lives);
    const isDeploying = await fs.stat(spiritDeployLock(name)).then(stat => stat.isFile(), e => false);
    if(isDeploying){
      currentLife.state = 'deploying';
    }
    return {
      name: name,
      lives: lives,
      state: currentLife.state,
      life: currentLife.life
    };
  }));
};

async function getLives(name, containers){
  const directories = await fs.readdir(spiritLives(name))
  .then(filter(life => isDirectory(spiritLife(name, life))));

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
        state: DEAD,
        uptime: ''
      }))
    ).sort((a,b) => a.life - b.life);
};

function getCurrentLife(lives){
  return lives.filter(life => life.state === RUNNING).reverse()[0]
    || lives.map(x => x).reverse()[0]
    || {life: '?', state: DEAD, uptime: ''};
}

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}
