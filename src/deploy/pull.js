const co = require('co');

module.exports = co.wrap(function*(image, tag, docker, log){
  log(`Pulling image ${image}:${tag}`);
  const stream = yield docker.pull(`${image}:${tag}`);
  yield followProgress(docker, stream, event => log(event));
  log(`Pulled image ${image}:${tag}`);
});

function followProgress(docker, stream, progress){
  return new Promise(function(resolve, reject){
    docker.$subject.modem.followProgress(stream, function(err, output){
      if(err) return reject(err);

      resolve(output);
    }, progress);
  });
}