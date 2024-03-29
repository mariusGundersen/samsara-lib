import fs from "fs/promises";
import stream from "stream";
import { spiritLifeContainerConfig, spiritLifeDeployLog } from "./paths.js";
import prettifyLogs from "./util/prettifyLogs.js";
import statusToState, { DEAD } from "./util/statusToState.js";

export default class Life {
  constructor(name, life, docker) {
    this.name = name;
    this.life = life;
    this._container = undefined;
    Object.defineProperty(this, "docker", { value: docker });
  }
  get status() {
    return this.docker
      .listContainers({
        filters: JSON.stringify({
          label: [
            `samsara.spirit.life=${this.life}`,
            `samsara.spirit.name=${this.name}`,
          ],
          status: ["running"],
        }),
      })
      .then((containers) =>
        containers.length > 0 ? Life.STATUS_ALIVE : Life.STATUS_DEAD
      );
  }
  get state() {
    return this.docker
      .listContainers({
        filters: JSON.stringify({
          all: true,
          label: [
            `samsara.spirit.life=${this.life}`,
            `samsara.spirit.name=${this.name}`,
          ],
        }),
      })
      .then((containers) =>
        containers.length == 0 ? DEAD : statusToState(containers[0].Status)
      );
  }
  get uptime() {
    return this.docker
      .listContainers({
        all: true,
        filters: JSON.stringify({
          label: [
            `samsara.spirit.life=${this.life}`,
            `samsara.spirit.name=${this.name}`,
          ],
        }),
      })
      .then((containers) =>
        containers.map((container) =>
          /^(Exited\s\(\d+\)\s|^Up\s)(.*)/.exec(container.Status)
        )
      )
      .then((matches) => matches.filter((match) => match))
      .then((matches) => matches.map((match) => match[2])[0] || " ");
  }
  get containerConfig() {
    return fs.readFile(spiritLifeContainerConfig(this.name, this.life), "utf8");
  }
  get deployLog() {
    return fs.readFile(spiritLifeDeployLog(this.name, this.life), "utf8");
  }
  containerLog(html, options) {
    return this.container
      .then((container) => container.logs(options))
      .then((logs) => logs.pipe(prettifyLogs({ html: !!html })))
      .catch(
        (e) =>
          new stream.Readable({
            read: function (n) {
              this.push(null);
            },
          })
      );
  }
  get inspect() {
    return this.container
      .then((container) => container.inspect())
      .catch((e) => null);
  }
  get container() {
    if (this._container !== undefined) {
      return Promise.resolve(this._container);
    }

    return this.docker
      .listContainers({
        all: true,
        filters: JSON.stringify({
          label: [
            `samsara.spirit.life=${this.life}`,
            `samsara.spirit.name=${this.name}`,
          ],
        }),
      })
      .then(
        function (result) {
          if (result.length) {
            return (this._container = this.docker.getContainer(result[0].Id));
          } else {
            return (this._container = null);
          }
        }.bind(this)
      );
  }
}

Life.STATUS_ALIVE = "running";
Life.STATUS_DEAD = "stopped";
