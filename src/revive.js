import createLogger from "./deploy/createLogger.js";
import { revive as revivePlan } from "./deploy/createPlan.js";
import { lock, unlock } from "./deploy/deployLock.js";
import startBeforeStop from "./deploy/startBeforeStop.js";
import stopBeforeStart from "./deploy/stopBeforeStart.js";

export default function (spirit, life, docker) {
  const log = createLogger(spirit.name);
  revive(spirit, life, docker, log);
  return log.eventEmitter;
}

async function revive(spirit, life, docker, log) {
  const spiritSettings = await spirit.settings;
  const currentLife = await spirit.currentLife;
  const nextLife = spirit.life(life);
  const plan = revivePlan(spiritSettings);
  log.start(life, plan, null);

  try {
    await lock(spirit.name);
    log.message("Deploy lock gained");
  } catch (e) {
    log.message(e);
    log.stop(e);
    return;
  }

  try {
    log.stage();
    const containerToStart = await nextLife.container;
    const containerToStop = await getContainerToStop(currentLife);

    log.stage();
    if (spiritSettings.deploymentMethod === "stop-before-start") {
      await stopBeforeStart(containerToStop, containerToStart, log);
    } else {
      await startBeforeStop(containerToStart, containerToStop, log);
    }

    log.stop();
  } catch (e) {
    log.message(e);
    log.stop(e);
  } finally {
    await unlock(spirit.name);
  }
}

function getNextLife(latestLife) {
  const life = (latestLife || { life: 0 }).life || 0;
  return life * 1 + 1;
}

function getContainerToStop(life) {
  return life ? life.container : Promise.resolve(null);
}
