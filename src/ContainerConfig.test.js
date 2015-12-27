import ContainerConfig from './ContainerConfig';
import sinon from 'sinon';
import fs from 'fs-promise';
import u from './util/unindent';

describe("ContainerConfig", function() {
  it("should toString with the file contents", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
    `);
    containerConfig.toString().should.equal("test:\n  image: 'nginx:latest'\n");
  });

  it("should deserialize the file contents", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
    `);
    containerConfig.yaml.should.deep.equal({test:{image: 'nginx:latest'}});
  });

  it("should provide the environment variables as an array", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        environment:
          - VIRTUAL_HOST=mariusgundersen.net
    `);

    containerConfig.environment.should.deep.equal([
      {key: 'VIRTUAL_HOST', value: 'mariusgundersen.net'}
    ]);
  });

  it("should provide the image", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
    `);

    containerConfig.image.should.equal('nginx');
  });

  it("should provide the tag", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
    `);

    containerConfig.tag.should.equal('latest');
  });

  it("should provide the tag even when it is missing", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx'
    `);

    containerConfig.tag.should.equal('latest');
  });

  it("should provide the environment variables as an array even when it's an object", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        environment:
          VIRTUAL_HOST: mariusgundersen.net
    `);

    containerConfig.environment.should.deep.equal([
      {key: 'VIRTUAL_HOST', value: 'mariusgundersen.net'}
    ]);
  });

  it("should provide the volumes", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        volumes:
          - '/container/path'
          - '/host/path:/container/path'
          - 'volume-name:/container/path:ro'
    `);

    containerConfig.volumes.should.deep.equal([
      {hostPath: '', containerPath: '/container/path', readOnly: false},
      {hostPath: '/host/path', containerPath: '/container/path', readOnly: false},
      {hostPath: 'volume-name', containerPath: '/container/path', readOnly: true}
    ]);
  });

  it("should provide the ports", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        ports:
          - '80'
          - '8080:80'
          - '127.0.0.1:8080:80'
    `);

    containerConfig.ports.should.deep.equal([
      {containerPort: '80', hostPort: '', hostIp: ''},
      {containerPort: '80', hostPort: '8080', hostIp: ''},
      {containerPort: '80', hostPort: '8080', hostIp: '127.0.0.1'}
    ]);
  });

  it("should provide the links", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        links:
          - 'service'
          - 'service:alias'
          - 'spirit(service)'
          - 'spirit(service):alias'
    `);

    containerConfig.links.should.deep.equal([
      {container: 'service', spirit: '', alias: 'service'},
      {container: 'service', spirit: '', alias: 'alias'},
      {container: '', spirit: 'service', alias: 'service'},
      {container: '', spirit: 'service', alias: 'alias'}
    ]);
  });

  it("should provide the volumesFrom", function(){
    const containerConfig = new ContainerConfig('test', u`
      test:
        image: 'nginx:latest'
        volumes_from:
          - 'service'
          - 'service:ro'
          - 'spirit(service)'
          - 'spirit(service):ro'
    `);

    containerConfig.volumesFrom.should.deep.equal([
      {container: 'service', spirit: '', readOnly: false},
      {container: 'service', spirit: '', readOnly: true},
      {container: '', spirit: 'service', readOnly: false},
      {container: '', spirit: 'service', readOnly: true}
    ]);
  });

  describe("setters", function(){
    let basicConfig;

    beforeEach(function(){
      basicConfig = new ContainerConfig('test', 'test: {}\n');
    });

    it("should set the config", function(){
      basicConfig.config = {
        image: 'nginx:1.7'
      };

      basicConfig.config.should.deep.equal({
        image: 'nginx:1.7'
      });
    });

    it("should set the image", function(){
      basicConfig.image = 'nginx';

      basicConfig.config.should.deep.equal({
        image: 'nginx:latest'
      });
    });

    it("should set the image and tag", function(){
      basicConfig.image = 'nginx';
      basicConfig.tag = '1.7'

      basicConfig.config.should.deep.equal({
        image: 'nginx:1.7'
      });
    });

    it("should set the environment", function(){
      basicConfig.environment = [
        {key: 'VIRTUAL_HOST', value:'mariusgundersen.net'}
      ];

      basicConfig.config.environment.should.deep.equal([
        'VIRTUAL_HOST=mariusgundersen.net'
      ]);
    });

    it("should set the volumes", function(){
      basicConfig.volumes = [
        {hostPath: '', containerPath: '/container/path', readOnly: false},
        {hostPath: '/host/path', containerPath: '/container/path', readOnly: false},
        {hostPath: 'volume-name', containerPath: '/container/path', readOnly: true}
      ];

      basicConfig.config.volumes.should.deep.equal([
        '/container/path',
        '/host/path:/container/path',
        'volume-name:/container/path:ro'
      ]);
    });

    it("should set the ports", function(){
      basicConfig.ports = [
        {containerPort: '80', hostPort: '', hostIp: ''},
        {containerPort: '80', hostPort: '8080', hostIp: ''},
        {containerPort: '80', hostPort: '8080', hostIp: '127.0.0.1'}
      ];

      basicConfig.config.ports.should.deep.equal([
        '80',
        '8080:80',
        '127.0.0.1:8080:80'
      ]);
    });

    it("should set the links", function(){
      basicConfig.links = [
        {container: 'service', spirit: '', alias: 'service'},
        {container: 'service', spirit: '', alias: 'alias'},
        {container: '', spirit: 'service', alias: 'service'},
        {container: '', spirit: 'service', alias: 'alias'}
      ];

      basicConfig.config.links.should.deep.equal([
        'service:service',
        'service:alias',
        'spirit(service):service',
        'spirit(service):alias'
      ]);
    });

    it("should set the volumesFrom", function(){
      basicConfig.volumesFrom = [
        {container: 'service', spirit: '', readOnly: false},
        {container: 'service', spirit: '', readOnly: true},
        {container: '', spirit: 'service', readOnly: false},
        {container: '', spirit: 'service', readOnly: true}
      ];

      basicConfig.config.volumes_from.should.deep.equal([
        'service',
        'service:ro',
        'spirit(service)',
        'spirit(service):ro'
      ]);
    });
  });

  describe("saving", function(){
    beforeEach(function(){
      sinon.stub(fs, 'writeFile').returns(Promise.resolve());
    });

    afterEach(function(){
      fs.writeFile.restore();
    });

    it("should write the contents of the config to the right file", async function(){
      const containerConfig = new ContainerConfig('test', u`
        test:
          image: 'nginx:latest'
      `);

      await containerConfig.save();

      fs.writeFile.should.have.been.calledWith('config/spirits/test/containerConfig.yml', "test:\n  image: 'nginx:latest'\n");
    });
  });

  describe("saving life", function(){
    beforeEach(function(){
      sinon.stub(fs, 'writeFile').returns(Promise.resolve());
    });

    afterEach(function(){
      fs.writeFile.restore();
    });

    it("should write the contents of the config to the right file", async function(){
      const containerConfig = new ContainerConfig('test', u`
        test:
          image: 'nginx:latest'
      `);

      await containerConfig.saveLife('2');

      fs.writeFile.should.have.been.calledWith('config/spirits/test/lives/2/containerConfig.yml', "test:\n  container_name: test_v2\n  image: 'nginx:latest'\n");
    });
  });
});
