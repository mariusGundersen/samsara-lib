import fs from 'fs-promise';
import {spiritDeployLock} from '../paths';

export async function lock(name){
  const file = await fs.open(spiritDeployLock(name), 'wx');
  fs.write(file, new Date().toISOString(), 0, 'utf8');
};
export async function unlock(name){
  fs.unlink(spiritDeployLock(name));
};
