'use strict'

const co = require('co');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');
const yaml = require('js-yaml');
const paths = require('../paths');

module.exports = function(eventEmitter){
  let plan;
  let setLogStream;
  const logStream = new Promise(function(resolve){
    setLogStream = resolve;
  });

  eventEmitter.on('start', co.wrap(function*(event){
    try{
      plan = event.plan;
      const name = event.spirit;
      const life = event.life+'';
      yield mkdirp(paths.life(name, life));
      const containerConfig = yaml.safeDump({
        [name]:event.containerConfig
      });
      yield fs.writeFile(paths.spiritLifeContainerConfig(name, life), containerConfig);
      const stream = fs.createWriteStream(paths.spiritLifeDeployLog(name, life));
      stream.write(pad('deploy')+'\n');
      setLogStream(stream);
    }catch(e){
      console.error(e);
    }
  }));

  eventEmitter.on('stage', co.wrap(function*(event){
    const stream = yield logStream;
    const stage = plan.shift();
    stream.write(pad(stage)+'\n');
  }));

  eventEmitter.on('message', co.wrap(function*(event){
    const stream = yield logStream;
    if(typeof(event.message) == 'string'){
      stream.write(event.message + '\n');
    }else if(event.message.progress){
      stream.write(event.message.id + ': ' + event.message.status + prettyProgress(event.message.progresseDetail) + '\n');
    }
  }));

  eventEmitter.on('stop', co.wrap(function*(event){
    const stream = yield logStream;
    stream.write(pad(event.error ? 'failed' : 'done')+'\n');
    if(event.error){
      stream.write(event.error.message);
    }
    stream.end();
  }));
};

function prettyProgress(progress){
  if(progress != null && typeof(progress) == 'object' && 'current' in progress && 'total' in progress){
    const percent = (progress.current/progress.total*100).toFixed(0);
    const mib = (progress.total/1024/1024).toFixed(2);
    return `(${percent}% of ${mib}MiB)`;
  }

  return '';
}

function pad(name){
  const padWith = 50 - 4 - name.length;
  let result = '';
  for(var i=0; i<padWith/2; i++){
    result+='=';
  }
  result+= '[ '+name+' ]';
  for(; i<padWith; i++){
    result+='=';
  }
  return result;
}