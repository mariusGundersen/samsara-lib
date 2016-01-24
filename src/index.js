import Docker from 'dockerode-promise';
import getNonSpiritContainers from './getNonSpiritContainers';
import getSpirits from './getSpirits';
import Spirit from './Spirit';
import createSpirit from './createSpirit';
import upgrade from './upgrade';
import {users} from './users';
import prettifyLogs from './util/prettifyLogs';

export default function samsara(options){
  options = options || {};

  var docker = options.docker || new Docker(options.dockerConfig);

  return {
    spirits(){
      return getSpirits(docker);
    },
    spirit(name){
      return new Spirit(name, docker);
    },
    createSpirit(name, image, tag){
      return createSpirit(name, image, tag);
    },
    containers(){
      return getNonSpiritContainers(docker);
    },
    container(id){
      const container = docker.getContainer(id);
      container.prettyLogs = (html, options) => container.logs(options).then(logs => logs.pipe(prettifyLogs({html:html})));
      return container;
    },
    upgrade(){
      return upgrade();
    },
    users(){
      return users();
    }
  };
};
