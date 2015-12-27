export default async function(lives, newestLife, docker, log){
  const containers = (await Promise.all(lives
  .filter(life => life.life < newestLife)
  .map(life => life.container.catch(e => null))))
  .filter(container => container);

  log(`Removing ${containers.length} old containers`);

  const imageIds = (await Promise.all(containers
  .map(container => container.inspect())
  .map(info => info.then(i => i.Image, e => log(e)))))
  .filter(imageId => imageId)
  .filter(distinct);

  await Promise.all(containers
  .map(async function(container){
    try{
      log('Removing container '+container.id);
      await container.remove({v: true});
      log('Removed container '+container.id);
    }catch(e){
      log('Failed to remove container '+container.id);
      log(e);
    }
  }));

  log(`Removing ${imageIds.length} old images`);

  return await imageIds.map(async function(imageId){
    try{
      const image = docker.getImage(imageId);
      log('Removing image '+imageId);
      await image.remove();
      log('Removed image '+imageId);
    }catch(e){
      log('Failed to remove image '+imageId);
      log(e);
    }
  });
};

function distinct(value, index, collection){
  return collection.indexOf(value) === index;
}