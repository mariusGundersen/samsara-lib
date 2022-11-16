import crypt from "apache-md5";
import { saveUser } from "./users.js";

export default class User {
  constructor(username, secret) {
    this.username = username;
    this.secret = secret;
  }
  set password(password) {
    this.secret = crypt(password);
  }
  async validate(password) {
    return this.secret === crypt(password, this.secret);
  }
  async save() {
    await saveUser(this);
  }
  toString() {
    return [this.username, this.secret].join(":");
  }
}

User.create = function (entry) {
  return new User(...entry.split(":"));
};
