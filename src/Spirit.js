import fs from "fs/promises";
import ContainerConfig from "./ContainerConfig.js";
import deploy from "./deploy.js";
import fileLogger from "./deploy/fileLogger.js";
import getSpiritLives from "./getSpiritLives.js";
import Life from "./Life.js";
import {
  spiritContainerConfig,
  spiritDeployLock,
  spiritSettingsJson,
} from "./paths.js";
import revive from "./revive.js";

export default class Spirit {
  constructor(name, docker) {
    this.name = name;
    Object.defineProperty(this, "docker", { value: docker });
  }
  get status() {
    return this.docker
      .listContainers({
        filters: JSON.stringify({
          label: ["samsara.spirit.life", "samsara.spirit.name=" + this.name],
          status: ["running"],
        }),
      })
      .then((containers) =>
        containers.length > 0 ? Spirit.STATUS_ALIVE : Spirit.STATUS_DEAD
      );
  }
  get containerConfig() {
    return fs
      .readFile(spiritContainerConfig(this.name))
      .then((result) => new ContainerConfig(this.name, result));
  }
  get settings() {
    return fs
      .readFile(spiritSettingsJson(this.name))
      .then((result) => JSON.parse(result));
  }
  mutateSettings(mutator) {
    return this.settings
      .then((settings) => {
        mutator(settings);
        return settings;
      })
      .then((settings) => JSON.stringify(settings, null, "  "))
      .then((json) => fs.writeFile(spiritSettingsJson(this.name), json));
  }
  get isDeploying() {
    return fs.access(spiritDeployLock(this.name)).then(
      () => true,
      () => false
    );
  }
  get lives() {
    return getSpiritLives(this.name, this.docker).then((lives) =>
      lives.map((life) => this.life(life))
    );
  }
  get currentLife() {
    return this.docker
      .listContainers({
        filters: JSON.stringify({
          label: ["samsara.spirit.life", "samsara.spirit.name=" + this.name],
          status: ["running"],
        }),
      })
      .then((containers) => {
        if (containers.length == 0) {
          return null;
        }

        const container = containers[0];
        return new Life(
          this.name,
          container.Labels["samsara.spirit.life"],
          this.docker
        );
      });
  }
  get latestLife() {
    return this.lives.then((lives) => lives[lives.length - 1]);
  }
  life(life) {
    return new Life(this.name, life, this.docker);
  }
  deploy() {
    const progress = deploy(this, this.docker);
    fileLogger(progress);
    return progress;
  }
  revive(life) {
    return revive(this, life, this.docker);
  }
}

Spirit.STATUS_ALIVE = "running";
Spirit.STATUS_DEAD = "stopped";
