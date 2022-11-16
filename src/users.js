import fs from "fs/promises";
import { authentication } from "./paths.js";
import User from "./User.js";

export async function users() {
  return await getAuth();
}

export async function addUser(username, password) {
  const entries = await getAuth();

  const user = new User(username);
  user.password = password;
  entries.push(user);

  await setAuth(entries);
}

export async function saveUser(user) {
  const entries = await getAuth();

  const foundAt = entries.map((entry) => entry.username).indexOf(user.username);
  if (foundAt < 0) throw new Error("Unknown user " + user.username);
  entries[foundAt] = user;

  await setAuth(entries);
}

async function getAuth() {
  try {
    const contents = await fs.readFile(authentication(), "utf8");
    return contents
      .split("\n")
      .filter((entry) => entry.length)
      .map(User.create);
  } catch (e) {
    return [];
  }
}

async function setAuth(entries) {
  const contents = entries.join("\n") + "\n";

  return await fs.writeFile(authentication(), contents);
}
