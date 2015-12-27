export default async function(image, docker, log){
  log(`Pulling image ${image}`);
  const stream = await docker.pull(image);
  await followProgress(docker, stream, event => log(event));
  log(`Pulled image ${image}`);
};

function followProgress(docker, stream, progress){
  return new Promise(function(resolve, reject){
    docker.$subject.modem.followProgress(stream, function(err, output){
      if(err) return reject(err);

      resolve(output);
    }, progress);
  });
}
