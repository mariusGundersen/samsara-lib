import fs from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import {spiritLives, spiritLife} from './paths';

export default async function(name, docker){
  const containers = await docker.listContainers({
    all: true,
    filters: JSON.stringify({
      "label":[
        "samsara.spirit.life",
        "samsara.spirit.name="+name
      ]
    })
  });

  await mkdirp(spiritLives(name));

  const files = await fs.readdir(spiritLives(name));
  const directories = await files.filter(life => isDirectory(spiritLife(name, life)));

  return directories
    .concat(containers
      .map(container => container.Labels['samsara.spirit.life'])
      .filter(container => directories.indexOf(container) === -1)
    ).sort((a,b) => a - b);
};

function isDirectory(path){
  return fs.stat(path).then(stat => stat.isDirectory());
}
