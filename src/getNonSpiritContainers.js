'use strict'
const co = require('co');

module.exports = co.wrap(function*(docker){
  const containers = yield docker.listContainers({all: true});

  return containers
    .filter(noSamsaraLabels)
    .map(container => {
      const name = container.Names.filter(name => name.lastIndexOf('/') === 0)[0].substr(1);
      return {
        name: name,
        id: container.Id,
        image: container.Image,
        state: container.Status.indexOf('Up')>=0 ? 'running' : 'stopped',
        status: container.Status
      };
    })
    .sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
});

function noSamsaraLabels(container){
  return Object.keys(container.Labels || {})
    .some(key => key.indexOf('samsara') === 0) === false;
}