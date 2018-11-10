import deploy from './deploy';

describe('deploy', function(){
  it('should deploy', function(){
    deploy({
      settings: Promise.resolve({})
    }, {});
  })
});
