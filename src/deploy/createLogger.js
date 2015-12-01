const events = require('events');

module.exports = function createLogger(name){
  const eventEmitter = new events.EventEmitter();
  return {
    eventEmitter: eventEmitter,
    start(life, plan){
      eventEmitter.emit('start', {spirit: name, life: life, plan: plan});
    },
    message(message){
      eventEmitter.emit('message', {spirit: name, message: message});
    },
    stage(){
      eventEmitter.emit('stage', {spirit: name});
    },
    stop(error){
      eventEmitter.emit('stop', {spirit: name, error: error});
    }
  }
}
