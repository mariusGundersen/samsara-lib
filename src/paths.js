import path from "path";

const AUTHENTICATION = path.normalize("config/authentication");
const CONFIG_SPIRITS = path.normalize("config/spirits");
const LIVES = "lives";
const DEPLOY_LOCK = "deploy.lock";
const CONFIG_JSON = "config.json";
const CONTAINER_CONFIG_YML = "containerConfig.yml";
const SETTINGS_JSON = "settings.json";
const DEPLOY_LOG = "deploy.log";

export function authentication() {
  return AUTHENTICATION;
}
export function spirits() {
  return CONFIG_SPIRITS;
}
export function spirit(name) {
  return path.join(CONFIG_SPIRITS, name);
}
export function spiritContainerConfigJson(name) {
  return path.join(CONFIG_SPIRITS, name, CONFIG_JSON);
}
export function spiritContainerConfig(name) {
  return path.join(CONFIG_SPIRITS, name, CONTAINER_CONFIG_YML);
}
export function spiritSettingsJson(name) {
  return path.join(CONFIG_SPIRITS, name, SETTINGS_JSON);
}
export function spiritDeployLock(name) {
  return path.join(CONFIG_SPIRITS, name, DEPLOY_LOCK);
}
export function spiritLives(name) {
  return path.join(CONFIG_SPIRITS, name, LIVES);
}
export function spiritLife(name, life) {
  return path.join(CONFIG_SPIRITS, name, LIVES, life);
}
export function spiritLifeContainerConfigJson(name, life) {
  return path.join(CONFIG_SPIRITS, name, LIVES, life, CONFIG_JSON);
}
export function spiritLifeContainerConfig(name, life) {
  return path.join(CONFIG_SPIRITS, name, LIVES, life, CONTAINER_CONFIG_YML);
}
export function spiritLifeDeployLog(name, life) {
  return path.join(CONFIG_SPIRITS, name, LIVES, life, DEPLOY_LOG);
}
