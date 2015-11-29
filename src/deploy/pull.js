const co = require('co');

module.exports = co.wrap(function*(image, tag, docker, log){
  log(`Pulling image ${image}:${tag}`);
  const stream = yield docker.pull(`${image}:${tag}`);
  yield followProgress(docker, stream, event => log(event));
  log(`Pulled image ${image}:${tag}`);
});

function followProgress(docker, stream, progress){
  return docker.modem.followProgress(stream, progress);
}