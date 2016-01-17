const asyncArray = require('./asyncArray');

describe('asyncArray', function(){
  it('should accept a promise predicate', function(){
    return asyncArray.filter([1,2,3], x => new Promise(r => r(x<3)))
    .then(l => l.should.eql([1,2]));
  });

  it('should accept a promise list', function(){
    return Promise.resolve([1,2,3])
    .then(asyncArray.filter(x => new Promise(r => r(x<3))))
    .then(l => l.should.eql([1,2]));
  });
});