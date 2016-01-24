import events from 'events';

export default function createLogger(name){
  const eventEmitter = new events.EventEmitter();
  return {
    eventEmitter: eventEmitter,
    start(life, plan, containerConfig){
      return Promise.resolve().then(() => eventEmitter.emit('start', {spirit: name, life: life, plan: plan, containerConfig: containerConfig}));
    },
    message(message){
      return Promise.resolve().then(() => eventEmitter.emit('message', {spirit: name, message: message}));
    },
    stage(){
      return Promise.resolve().then(() => eventEmitter.emit('stage', {spirit: name}));
    },
    stop(error){
      return Promise.resolve().then(() => eventEmitter.emit('stop', {spirit: name, error: error}));
    }
  }
}
