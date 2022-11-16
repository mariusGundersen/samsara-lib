import Docker from "dockerode-promise";
import createSpirit from "./createSpirit.js";
import getNonSpiritContainers from "./getNonSpiritContainers.js";
import getSpirits from "./getSpirits.js";
import Spirit from "./Spirit.js";
import upgrade from "./upgrade.js";
import { users } from "./users.js";
import prettifyLogs from "./util/prettifyLogs.js";

export default function samsara(options) {
  options = options || {};

  var docker = options.docker || new Docker(options.dockerConfig);

  return {
    spirits() {
      return getSpirits(docker);
    },
    spirit(name) {
      return new Spirit(name, docker);
    },
    createSpirit(name, image, tag) {
      return createSpirit(name, image, tag);
    },
    containers() {
      return getNonSpiritContainers(docker);
    },
    container(id) {
      const container = docker.getContainer(id);
      container.prettyLogs = (html, options) =>
        container
          .logs(options)
          .then((logs) => logs.pipe(prettifyLogs({ html: html })));
      return container;
    },
    upgrade() {
      return upgrade();
    },
    users() {
      return users();
    },
  };
}
