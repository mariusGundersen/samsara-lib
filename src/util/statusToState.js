export default function statusToState(status){
  if(status === 'Dead'){
    return DEAD;
  }
  if(status === 'Created'){
    return CREATED;
  }
  if(/^Restarting/.test(status)){
    return RESTARTING;
  }
  if(/^Up .* \(Paused\)$/.test(status)){
    return PAUSED;
  }
  if(/^Up/.test(status)){
    return RUNNING;
  }
  return EXITED;
};

export const PAUSED = 'paused';
export const RESTARTING = 'restarting';
export const RUNNING = 'running';
export const DEAD = 'dead';
export const CREATED = 'created';
export const EXITED = 'exited';
