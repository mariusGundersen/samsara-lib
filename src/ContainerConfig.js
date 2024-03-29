import fs from "fs/promises";
import yaml from "js-yaml";
import { spiritContainerConfig, spiritLifeContainerConfig } from "./paths.js";

export default class ContainerConfig {
  constructor(name, fileContent) {
    fileContent = fileContent || name + ": {}\n";
    this._name = name;
    this._fileContent = fileContent;
    this.yaml = yaml.safeLoad(fileContent);
  }
  get config() {
    return this.yaml[this._name];
  }
  set config(value) {
    this.yaml[this._name] = value;
  }
  get image() {
    return (this.config.image || "").split(":")[0];
  }
  set image(value) {
    this.config.image = value + ":" + this.tag;
  }
  get tag() {
    return (this.config.image || "").split(":")[1] || "latest";
  }
  set tag(value) {
    this.config.image = this.image + ":" + value;
  }
  get environment() {
    if (Array.isArray(this.config.environment)) {
      return this.config.environment
        .map((env) => env.split("="))
        .map((pair) => ({
          key: pair.shift(),
          value: pair.join("="),
        }));
    } else {
      return Object.keys(this.config.environment || {}).map((key) => ({
        key: key,
        value: this.config.environment[key],
      }));
    }
  }
  set environment(value) {
    if (!value || !value.length) {
      delete this.config.environment;
      return;
    }

    this.config.environment = value.map((env) => env.key + "=" + env.value);
  }
  get volumes() {
    return (this.config.volumes || [])
      .map((volume) => volume.split(":"))
      .map((parts) => ({
        containerPath: parts[parts.length == 1 ? 0 : 1],
        hostPath: parts.length == 1 ? "" : parts[0],
        readOnly: parts.length == 3 ? parts[2] === "ro" : false,
      }));
  }
  set volumes(value) {
    if (!value || !value.length) {
      delete this.config.volumes;
      return;
    }

    this.config.volumes = value.map((volume) => {
      if (volume.hostPath) {
        if (volume.readOnly) {
          return volume.hostPath + ":" + volume.containerPath + ":ro";
        } else {
          return volume.hostPath + ":" + volume.containerPath;
        }
      } else {
        if (volume.readOnly) {
          return volume.containerPath + ":ro";
        } else {
          return volume.containerPath;
        }
      }
    });
  }
  get ports() {
    return (this.config.ports || []).map((port) => {
      const parts = port.split(":");
      const create = (containerPort, hostPort, hostIp) => {
        const lastParts = containerPort.split("/");
        const protocols = lastParts.length > 1 ? lastParts[1] : "tcpudp";
        return {
          containerPort: lastParts[0],
          hostPort: hostPort,
          hostIp: hostIp,
          udp: protocols.indexOf("udp") != -1,
          tcp: protocols.indexOf("tcp") != -1,
        };
      };
      if (parts.length == 1) {
        return create(parts[0], "", "");
      } else if (parts.length == 2) {
        return create(parts[1], parts[0], "");
      } else if (parts.length == 3) {
        return create(parts[2], parts[1], parts[0]);
      }
    });
  }
  set ports(value) {
    if (!value || !value.length) {
      delete this.config.ports;
      return;
    }

    this.config.ports = value.map((port) => {
      const protocol =
        (port.tcp == false ? "" : "tcp") + (port.udp == false ? "" : "udp");
      if (port.hostPort) {
        if (port.hostIp) {
          return (
            port.hostIp +
            ":" +
            port.hostPort +
            ":" +
            port.containerPort +
            "/" +
            protocol
          );
        } else {
          return port.hostPort + ":" + port.containerPort + "/" + protocol;
        }
      } else {
        return port.containerPort + "/" + protocol;
      }
    });
  }
  get links() {
    return (this.config.links || []).map((link) => {
      const parts = link.split(":");
      const match = /^spirit\(([a-zA-Z0-9_\.-]+)\)$/.exec(parts[0]);
      if (match) {
        if (parts.length == 1) {
          return { spirit: match[1], alias: match[1], container: "" };
        } else if (parts.length == 2) {
          return { spirit: match[1], alias: parts[1], container: "" };
        }
      } else {
        if (parts.length == 1) {
          return { container: parts[0], alias: parts[0], spirit: "" };
        } else if (parts.length == 2) {
          return { container: parts[0], alias: parts[1], spirit: "" };
        }
      }
    });
  }
  set links(value) {
    if (!value || !value.length) {
      delete this.config.links;
      return;
    }

    this.config.links = value.map((link) => {
      if (link.spirit) {
        return `spirit(${link.spirit}):${link.alias}`;
      } else {
        return `${link.container}:${link.alias}`;
      }
    });
  }
  get labels() {
    if (Array.isArray(this.config.labels)) {
      return this.config.labels
        .map((env) => env.split("="))
        .map((pair) => ({
          key: pair.shift(),
          value: pair.length === 0 ? "" : pair.join("="),
        }));
    } else {
      return Object.keys(this.config.labels || {}).map((key) => ({
        key: key,
        value: this.config.labels[key],
      }));
    }
  }
  set labels(value) {
    if (!value || !value.length) {
      delete this.config.labels;
      return;
    }

    this.config.labels = value.map((x) =>
      x.value ? x.key + "=" + x.value : x.key
    );
  }
  get volumesFrom() {
    return (this.config.volumes_from || []).map((volumeFrom) => {
      const parts = volumeFrom.split(":");
      const match = /^spirit\(([a-zA-Z0-9_\.-]+)\)$/.exec(parts[0]);
      if (match) {
        if (parts.length == 1) {
          return { spirit: match[1], readOnly: false, container: "" };
        } else if (parts.length == 2) {
          return {
            spirit: match[1],
            readOnly: parts[1] === "ro",
            container: "",
          };
        }
      } else {
        if (parts.length == 1) {
          return { container: parts[0], readOnly: false, spirit: "" };
        } else if (parts.length == 2) {
          return {
            container: parts[0],
            readOnly: parts[1] === "ro",
            spirit: "",
          };
        }
      }
    });
  }
  set volumesFrom(value) {
    if (!value || !value.length) {
      delete this.config.volumes_from;
      return;
    }

    this.config.volumes_from = value.map((volumeFrom) => {
      if (volumeFrom.spirit) {
        return (
          `spirit(${volumeFrom.spirit})` + (volumeFrom.readOnly ? ":ro" : "")
        );
      } else {
        return volumeFrom.container + (volumeFrom.readOnly ? ":ro" : "");
      }
    });
  }
  get restartPolicy() {
    return this.config.restart || "";
  }
  set restartPolicy(value) {
    this.config.restart = value;
  }
  save() {
    const output = yaml.safeDump(this.yaml);
    return fs.writeFile(spiritContainerConfig(this._name), output);
  }
  saveLife(life) {
    const config = Object.assign(
      { container_name: this._name + "_v" + life },
      this.config
    );
    const output = yaml.safeDump({
      [this._name]: config,
    });
    return fs.writeFile(spiritLifeContainerConfig(this._name, life), output);
  }
  toString() {
    return this._fileContent;
  }
}
