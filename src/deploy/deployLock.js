import fs from "fs/promises";
import { spiritDeployLock } from "../paths.js";

export async function lock(name) {
  const file = await fs.open(spiritDeployLock(name), "wx");
  fs.writeFile(file, new Date().toISOString(), 0, "utf8");
}
export async function unlock(name) {
  fs.unlink(spiritDeployLock(name));
}
