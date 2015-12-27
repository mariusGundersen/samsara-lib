import getSpiritLives from './getSpiritLives';
import fs from 'fs-promise';

import sinon from 'sinon';

describe("getSpiritLives", function() {
  let result,
      docker;

  beforeEach(async function(){
    sinon.stub(fs, 'readdir')
      .returns(Promise.resolve(['3', '1', '2']));

    sinon.stub(fs, 'stat')
      .returns(Promise.resolve({isDirectory(){return true}}));

    docker = {
      listContainers: sinon.stub().returns(Promise.resolve([
        {Labels:{'samsara.spirit.life':'2'}},
        {Labels:{'samsara.spirit.life':'3'}},
        {Labels:{'samsara.spirit.life':'4'}}
      ]))
    };

    because: {
      result = await getSpiritLives('test', docker);
    }
  });

  afterEach(function(){
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should read dir from the right directory", function(){
    fs.readdir.should.have.been.calledWith('config/spirits/test/lives');
  });

  it("should get all containers with the right name", function(){
    docker.listContainers.should.have.been.calledWith({
      all: true,
      filters: '{"label":["samsara.spirit.life","samsara.spirit.name=test"]}'
    });
  });

  it("should return names which are both containers and directories", function(){
    result.should.contain('2');
    result.should.contain('3');
  });

  it("should return names which are only containers", function(){
    result.should.contain('4');
  });

  it("should return names which are only directories", function(){
    result.should.contain('1');
  });

  it("should not return duplicates", function(){
    result.length.should.equal(4);
  });

  it("should return the spirits in sorted order", function(){
    result.should.eql(['1', '2', '3', '4']);
  });
});
