const events = require('events');

module.exports = function createLogger(name){
  const eventEmitter = new events.EventEmitter();
  return {
    eventEmitter: eventEmitter,
    message(message){
      eventEmitter.emit('message', {spirit: name, message: message});
    },
    plan(plan){
      eventEmitter.emit('plan', {spirit: name, plan: plan});
    },
    stage(){
      eventEmitter.emit('stage', {spirit: name});
    }
  }
}
