const fs = require('fs-promise');
const paths = require('../paths');

module.exports = {
  lock(name){
    return fs.open(paths.deployLock(name), 'wx')
    .then(file => fs.write(file, new Date().toISOString(), 0, 'utf8'));
  },
  unlock(name){
    return fs.unlink(paths.deployLock(name));
  }
};
