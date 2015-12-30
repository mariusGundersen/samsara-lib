const co = require('co');

module.exports = co.wrap(function*(image, docker, log){
  log(`Pulling image ${image}`);
  const stream = yield docker.pull(image);
  yield followProgress(docker, stream, event => log(event));
  log(`Pulled image ${image}`);
});

function followProgress(docker, stream, progress){
  return new Promise(function(resolve, reject){
    docker.$subject.modem.followProgress(stream, function(err, output){
      if(err) return reject(err);

      resolve(output);
    }, progress);
  });
}