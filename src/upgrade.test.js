'use strict'
const upgrade = require('./upgrade');
const co = require('co');
const fs = require('fs-promise');
const descartes = require('descartes');
const sinon = require("sinon");
const u = require('./util/unindent');

describe("upgrade", function() {

  beforeEach(function(){
    this.jar = new descartes.Jar();
    this.readdir = this.jar.probe('fs.readdir');
    this.stat = this.jar.probe('fs.stat');
    this.readFile = this.jar.probe('fs.readFile');
    this.writeFile = this.jar.probe('fs.writeFile');
    sinon.stub(fs, 'readdir', this.readdir);
    sinon.stub(fs, 'stat', this.stat);
    sinon.stub(fs, 'readFile', this.readFile);
    sinon.stub(fs, 'writeFile', this.writeFile);
  });

  afterEach(function(){
    fs.readdir.restore();
    fs.stat.restore();
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  it("should work", co.wrap(function *(){
    const result = upgrade();

    this.readdir.resolves(['test', 'file.json']);
    yield this.readdir.called(descartes.withExactArgs('config/spirits'));

    this.stat.resolves(isDirectory(true));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test'));
    this.stat.resolves(isDirectory(false));
    yield this.stat.called(descartes.withExactArgs('config/spirits/file.json'));

    this.stat.resolves(isFile(false));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/settings.json'));
    this.stat.resolves(isFile(false));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/containerConfig.yml'));
    this.stat.resolves(isFile(true));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/config.json'));

    this.readFile.resolves(JSON.stringify({
      deploymentMethod: 'start-before-stop',
      cleanupLimit: 0,
      description: 'test',
      url: 'https://test.mariusgundersen.net',
      webhook: {
        enable: false
      },
      image: 'nginx',
      tag: 'latest',
      env: {},
      volumes: {},
      ports: {},
      links: {},
      volumesFrom: []
    }, null, '  '));
    yield this.readFile.called(descartes.withArgs('config/spirits/test/config.json'));

    const writeSettingsCall = yield this.writeFile.called(descartes.withArgs('config/spirits/test/settings.json'));
    writeSettingsCall.args[1].should.equal(JSON.stringify({
      name: 'test',
      deploymentMethod: 'start-before-stop',
      cleanupLimit: 0,
      description: 'test',
      url: 'https://test.mariusgundersen.net',
      webhook: {
        enable: false
      }
    }, null, '  '));

    const writeContainerConfigCall = yield this.writeFile.called(descartes.withArgs('config/spirits/test/containerConfig.yml'));
    writeContainerConfigCall.args[1].should.equal(u`
      test:
        image: 'nginx:latest'
        environment: []
        volumes: []
        ports: []
        links: []
        volumes_from: []
      `);

    this.readdir.resolves(['1']);
    yield this.readdir.called(descartes.withArgs('config/spirits/test/lives'));
    this.stat.resolves(isDirectory(true));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/lives/1'));

    this.stat.resolves(isFile(false));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/lives/1/containerConfig.yml'));
    this.stat.resolves(isFile(true));
    yield this.stat.called(descartes.withExactArgs('config/spirits/test/lives/1/config.json'));

    this.readFile.resolves(JSON.stringify({
      deploymentMethod: 'start-before-stop',
      cleanupLimit: 0,
      description: 'test',
      url: 'https://test.mariusgundersen.net',
      webhook: {
        enable: false
      },
      image: 'nginx',
      tag: 'latest',
      env: {},
      volumes: {},
      ports: {},
      links: {},
      volumesFrom: []
    }, null, '  '));
    yield this.readFile.called(descartes.withArgs('config/spirits/test/lives/1/config.json'));

    const writeLifeContainerConfigCall = yield this.writeFile.called(descartes.withArgs('config/spirits/test/lives/1/containerConfig.yml'));
    writeLifeContainerConfigCall.args[1].should.equal(u`
      test:
        image: 'nginx:latest'
        environment: []
        volumes: []
        ports: []
        links: []
        volumes_from: []
      `);

    yield result;
    this.jar.done();
  }));
});

function isDirectory(isDir){
  return {
    isDirectory(){
      return isDir
    }
  };
}

function isFile(isFile){
  return {
    isFile(){
      return isFile
    }
  };
}