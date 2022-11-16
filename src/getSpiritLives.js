import fs from "fs/promises";
import { spiritLife, spiritLives } from "./paths.js";

export default async function (name, docker) {
  const containers = await docker.listContainers({
    all: true,
    filters: JSON.stringify({
      label: ["samsara.spirit.life", "samsara.spirit.name=" + name],
    }),
  });

  await fs.mkdir(spiritLives(name), { recursive: true });

  const files = await fs.readdir(spiritLives(name));
  const directories = await files.filter((life) =>
    isDirectory(spiritLife(name, life))
  );

  return directories
    .concat(
      containers
        .map((container) => container.Labels["samsara.spirit.life"])
        .filter((container) => directories.indexOf(container) === -1)
    )
    .sort((a, b) => a - b);
}

function isDirectory(path) {
  return fs.stat(path).then((stat) => stat.isDirectory());
}
