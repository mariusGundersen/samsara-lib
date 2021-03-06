import {lock, unlock} from './deployLock';
import sinon from 'sinon';
import fs from 'fs-promise';

describe("deployLock", function(){
  it("should have a lock method", function(){
    lock.should.exist;
  });

  it("should have an unlock method", function(){
    unlock.should.exist;
  });

  describe("lock", function(){
    beforeEach(function(){
      sinon.stub(fs, 'open')
        .returns(Promise.resolve('file'));

      sinon.stub(fs, 'write')
        .returns(Promise.resolve());

      because: {
        return lock('test');
      }
    });

    afterEach(function(){
      fs.open.restore();
      fs.write.restore();
    });

    it("should open the right path with wk", function(){
      fs.open.should.have.been.calledWith('config/spirits/test/deploy.lock', 'wx');
    });

    it("should write the current date to the string", function(){
      fs.write.should.have.been.calledWith('file', sinon.match(date => Date.parse(date)), 0, 'utf8');
    });
  });

  describe("unlock", function(){
    beforeEach(function(){
      sinon.stub(fs, 'unlink')
        .returns(Promise.resolve());

      because: {
        return unlock('test');
      }
    });

    afterEach(function(){
      fs.unlink.restore();
    });

    it("should unlink the right path", function(){
      fs.unlink.should.have.been.calledWith('config/spirits/test/deploy.lock');
    });
  });
});
