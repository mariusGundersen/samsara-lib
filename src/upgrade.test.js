import upgrade from './upgrade';
import fs from 'fs-promise';
import {Jar, withArgs, withExactArgs} from 'descartes';
import sinon from 'sinon';
import u from './util/unindent';

describe("upgrade", function() {

  beforeEach(function(){
    this.jar = new Jar();
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

  it("should work", async function(){
    const result = upgrade();

    this.readdir.resolves(['test', 'file.json']);
    await this.readdir.called(withExactArgs('config/spirits'));

    this.stat.resolves(isDirectory(true));
    await this.stat.called(withExactArgs('config/spirits/test'));
    this.stat.resolves(isDirectory(false));
    await this.stat.called(withExactArgs('config/spirits/file.json'));

    this.stat.resolves(isFile(false));
    await this.stat.called(withExactArgs('config/spirits/test/settings.json'));
    this.stat.resolves(isFile(false));
    await this.stat.called(withExactArgs('config/spirits/test/containerConfig.yml'));
    this.stat.resolves(isFile(true));
    await this.stat.called(withExactArgs('config/spirits/test/config.json'));

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
    await this.readFile.called(withArgs('config/spirits/test/config.json'));

    const writeSettingsCall = await this.writeFile.called(withArgs('config/spirits/test/settings.json'));
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

    const writeContainerConfigCall = await this.writeFile.called(withArgs('config/spirits/test/containerConfig.yml'));
    writeContainerConfigCall.args[1].should.equal(u`
      test:
        image: 'nginx:latest'
      `);

    this.readdir.resolves(['1']);
    await this.readdir.called(withArgs('config/spirits/test/lives'));
    this.stat.resolves(isDirectory(true));
    await this.stat.called(withExactArgs('config/spirits/test/lives/1'));

    this.stat.resolves(isFile(false));
    await this.stat.called(withExactArgs('config/spirits/test/lives/1/containerConfig.yml'));
    this.stat.resolves(isFile(true));
    await this.stat.called(withExactArgs('config/spirits/test/lives/1/config.json'));

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
    await this.readFile.called(withArgs('config/spirits/test/lives/1/config.json'));

    const writeLifeContainerConfigCall = await this.writeFile.called(withArgs('config/spirits/test/lives/1/containerConfig.yml'));
    writeLifeContainerConfigCall.args[1].should.equal(u`
      test:
        container_name: test_v1
        image: 'nginx:latest'
      `);

    await result;
    this.jar.done();
  });
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
