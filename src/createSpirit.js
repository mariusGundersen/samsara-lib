import fs from "fs/promises";
import yaml from "js-yaml";
import {
  spirit,
  spiritContainerConfig,
  spiritLives,
  spiritSettingsJson,
} from "./paths.js";

export default async function (name, image, tag) {
  const spiritSettings = {
    name: name,
    deploymentMethod: "start-before-stop",
    cleanupLimit: 10,
    description: "",
    url: "",
    webhook: {
      enable: false,
      secret: "",
      matchTag: "",
    },
  };

  const containerConfig = {
    image: image + ":" + tag,
    restart: "unless-stopped",
  };

  await fs.mkdir(spirit(name), { recursive: true });
  await fs.mkdir(spiritLives(name), { recursive: true });
  await fs.writeFile(
    spiritContainerConfig(name),
    yaml.safeDump({ [name]: containerConfig })
  );
  await fs.writeFile(
    spiritSettingsJson(name),
    JSON.stringify(spiritSettings, null, "  ")
  );
}
