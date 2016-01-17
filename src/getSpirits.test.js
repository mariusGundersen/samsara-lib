'use strict'
const getSpirits = require('./getSpirits');
const fs = require('fs-promise');
const co = require('co');
const sinon = require("sinon");
const descartes = require('descartes');
const expect = chai.expect;

describe("getSpirits", function() {

  beforeEach(co.wrap(function*(){
    this.jar = new descartes.Jar();
    this.readdir = this.jar.probe('fs.readdir');
    this.stat = this.jar.probe('fs.stat');
    this.listContainers = this.jar.probe('docker.listContainers');

    sinon.stub(fs, 'readdir', this.readdir);

    sinon.stub(fs, 'stat', this.stat);

    this.docker = {
      listContainers: this.listContainers
    };
  }));

  afterEach(function(){
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should return the spirits", co.wrap(function*(){
    const result = getSpirits(this.docker);

    this.listContainers.resolves([]);
    yield this.listContainers.called().then(call => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal('{"label":["samsara.spirit.life","samsara.spirit.name"]}');
    });

    this.readdir.resolves(['Test', 'website', 'database'])
    yield this.readdir.called(descartes.withArgs('config/spirits'));

    this.stat.resolves({isDirectory(){return true}});
    yield this.stat.called(descartes.withArgs('config/spirits/Test'));
    yield this.stat.called(descartes.withArgs('config/spirits/website'));
    yield this.stat.called(descartes.withArgs('config/spirits/database'));

    this.readdir.resolves([])
    yield this.readdir.called(descartes.withArgs('config/spirits/database/lives'));
    yield this.readdir.called(descartes.withArgs('config/spirits/Test/lives'));
    yield this.readdir.called(descartes.withArgs('config/spirits/website/lives'));

    this.stat.rejects(new Error());
    yield this.stat.called(descartes.withArgs('config/spirits/database/deploy.lock'));
    yield this.stat.called(descartes.withArgs('config/spirits/Test/deploy.lock'));
    yield this.stat.called(descartes.withArgs('config/spirits/website/deploy.lock'));

    const spirits = yield result;
    spirits.map(x => x.name).should.eql(['database', 'Test', 'website']);
    this.jar.done();
  }));

  it("should work when a spirit has no lives", co.wrap(function*(){
    const result = getSpirits(this.docker);

    this.listContainers.resolves([]);
    yield this.listContainers.called().then(call => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal('{"label":["samsara.spirit.life","samsara.spirit.name"]}');
    });

    this.readdir.resolves(['Test'])
    yield this.readdir.called(descartes.withArgs('config/spirits'));

    this.stat.resolves({isDirectory(){return true}});
    yield this.stat.called(descartes.withArgs('config/spirits/Test'));

    this.readdir.resolves([])
    yield this.readdir.called(descartes.withArgs('config/spirits/Test/lives'));

    this.stat.rejects(new Error());
    yield this.stat.called(descartes.withArgs('config/spirits/Test/deploy.lock'));

    const spirits = yield result;
    spirits.map(x => x.name).should.eql(['Test']);
    spirits[0].lives.should.eql([]);
    spirits[0].state.should.equal('dead');
    spirits[0].life.should.equal('?');
    this.jar.done();
  }));

  it("should work when a spirit has lives", co.wrap(function*(){
    const result = getSpirits(this.docker);

    this.listContainers.resolves([
      createContainer('Test', 2, 'Exited (1) 2 minutes ago'),
      createContainer('Test', 3, 'Up 2 minutes')
    ]);
    yield this.listContainers.called().then(call => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal('{"label":["samsara.spirit.life","samsara.spirit.name"]}');
    });

    this.readdir.resolves(['Test'])
    yield this.readdir.called(descartes.withArgs('config/spirits'));

    this.stat.resolves({isDirectory(){return true}});
    yield this.stat.called(descartes.withArgs('config/spirits/Test'));

    this.readdir.resolves(['1','2'])
    yield this.readdir.called(descartes.withArgs('config/spirits/Test/lives'));

    this.stat.resolves({isDirectory(){return true}});
    yield this.stat.called(descartes.withArgs('config/spirits/Test/lives/1'));
    yield this.stat.called(descartes.withArgs('config/spirits/Test/lives/2'));

    this.stat.rejects(new Error());
    yield this.stat.called(descartes.withArgs('config/spirits/Test/deploy.lock'));

    const spirits = yield result;
    spirits.map(x => x.name).should.eql(['Test']);
    spirits[0].state.should.equal('running');
    spirits[0].life.should.equal(3);
    const lives = spirits[0].lives;
    lives.length.should.equal(3);
    lives[0].life.should.equal(1);
    lives[0].state.should.equal('dead');
    lives[0].uptime.should.equal('');
    lives[1].life.should.equal(2);
    lives[1].state.should.equal('exited');
    lives[1].uptime.should.equal('2 minutes ago');
    lives[2].life.should.equal(3);
    lives[2].state.should.equal('running');
    lives[2].uptime.should.equal('2 minutes');

    this.jar.done();
  }));
});

function createContainer(name, life, status){
  return {
    Labels: {
      'samsara.spirit.name': name,
      'samsara.spirit.life': life,
    },
    Status: status
  }
}