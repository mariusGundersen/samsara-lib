import fs from 'fs-promise';
import {spiritContainerConfig, spiritSettingsJson, spiritDeployLock} from './paths';
import getSpiritLives from './getSpiritLives';
import deploy from './deploy';
import revive from './revive';
import Life from './Life';
import fileLogger from './deploy/fileLogger';
import ContainerConfig from './ContainerConfig';

export default class Spirit{
  constructor(name, docker){
    this.name = name;
    Object.defineProperty(this, 'docker', {value:docker});
  }
  get status(){
    return this.docker.listContainers({
      filters: JSON.stringify({
        label:[
          "samsara.spirit.life",
          "samsara.spirit.name="+this.name
        ],
        status: ['running']
      })
    }).then(containers =>
      containers.length > 0
      ? Spirit.STATUS_ALIVE
      : Spirit.STATUS_DEAD);
  }
  get containerConfig(){
    return fs.readFile(spiritContainerConfig(this.name))
    .then(result => new ContainerConfig(this.name, result));
  }
  get settings(){
    return fs.readFile(spiritSettingsJson(this.name))
    .then(result => JSON.parse(result));
  }
  mutateSettings(mutator){
    return this.settings
    .then(settings => {
      mutator(settings);
      return settings;
    })
    .then(settings => JSON.stringify(settings, null, '  '))
    .then(json => fs.writeFile(spiritSettingsJson(this.name), json));
  }
  get isDeploying(){
    return fs.exists(spiritDeployLock(this.name));
  }
  get lives(){
    return getSpiritLives(this.name, this.docker)
    .then(lives => lives.map(life => this.life(life)));
  }
  get currentLife(){
    return this.docker.listContainers({
      filters: JSON.stringify({
        label:[
          "samsara.spirit.life",
          "samsara.spirit.name="+this.name
        ],
        status: ['running']
      })
    }).then(containers => {
      if(containers.length == 0){
        return null;
      }

      const container = containers[0];
      return new Life(this.name, container.Labels['samsara.spirit.life'], this.docker);
    });
  }
  get latestLife(){
    return this.lives.then(lives => lives[lives.length - 1]);
  }
  life(life){
    return new Life(this.name, life, this.docker);
  }
  deploy(){
    const progress = deploy(this, this.docker);
    fileLogger(progress);
    return progress;
  }
  revive(life){
    return revive(this, life, this.docker);
  }
};

Spirit.STATUS_ALIVE = 'running';
Spirit.STATUS_DEAD = 'stopped';
