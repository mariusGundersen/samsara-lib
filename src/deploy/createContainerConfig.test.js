const createContainerConfig = require('./createContainerConfig');
const sinon = require('sinon');
const descartes = require('descartes');
const co = require('co');

describe("createContainerConfig", function(){
  it("should be a function", function(){
    createContainerConfig.should.be.a('Function');
  });

  it("should have the image and name", co.wrap(function *(){
    const result = yield createContainerConfig('test', 2, {
      image: 'nginx:latest'
    }, _ => _);

    result.should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {}
      }
    });
  }));

  it("should have the correct environment as object values", co.wrap(function *(){
    const result = yield createContainerConfig('test', 2, {
      image: 'nginx:latest',
      environment: {
        'VIRTUAL_HOST': 'mariusgundersen.net'
      }
    }, _ => _);

    result.should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [
        'VIRTUAL_HOST=mariusgundersen.net'
      ],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {}
      }
    });
  }));

  it("should have the correct environment as array values", co.wrap(function *(){
    const result = yield createContainerConfig('test', 2, {
      image: 'nginx:latest',
      environment: [
        'VIRTUAL_HOST=mariusgundersen.net'
      ]
    }, _ => _);

    result.should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [
        'VIRTUAL_HOST=mariusgundersen.net'
      ],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {}
      }
    });
  }));

  it("should have the correct volumes values", co.wrap(function *(){
    const result = yield createContainerConfig('test', 2, {
      image: 'nginx:latest',
      volumes: [
        '/anonymous/volume',
        '/host/path:/container/path',
        'named-volume:/path/on/container',
        '/path/on/host:/read/only/volume:ro'
      ]
    }, _ => _);

    result.should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [],
      Volumes: {
        '/anonymous/volume': {},
        '/container/path': {},
        '/path/on/container': {},
        '/read/only/volume': {}
      },
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [
          '/anonymous/volume',
          '/host/path:/container/path',
          'named-volume:/path/on/container',
          '/path/on/host:/read/only/volume:ro'
        ],
        VolumesFrom: [],
        PortBindings: {}
      }
    });
  }));

  it("should have the correct links values", co.wrap(function *(){
    const getCurrentLife = descartes.probe('getCurrentLife');

    const result = createContainerConfig('test', 2, {
      image: 'nginx:latest',
      links: [
        'service:alias',
        'service',
        'spirit(db):database',
        'spirit(db)',
      ]
    }, name => ({
      get currentLife(){
        return getCurrentLife(name);
      }
    }));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id:'1234abcd'
      })
    });
    yield getCurrentLife.called(descartes.withArgs('db'));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id:'abcd1234'
      })
    });
    yield getCurrentLife.called(descartes.withArgs('db'));

    (yield result).should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [
          'service:alias',
          'service',
          '1234abcd:database',
          'abcd1234:db'
        ],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {}
      }
    });
  }));

  it("should have the correct port bindings", co.wrap(function *(){
    const result = yield createContainerConfig('test', 2, {
      image: 'nginx:latest',
      ports: [
        '80',
        '80:70',
        '127.0.0.1:90:8080'
      ]
    }, _ => _);

    result.should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {
          '80/tcp':[],
          '70/tcp':[{HostPort:'80'}],
          '8080/tcp':[{HostPort:'90', HostIp:'127.0.0.1'}]
        }
      }
    });
  }));

  it("should have the correct volumesFrom values", co.wrap(function *(){
    const getCurrentLife = descartes.probe('getCurrentLife');

    const result = createContainerConfig('test', 2, {
      image: 'nginx:latest',
      volumes_from: [
        'db',
        'config:ro',
        'spirit(db)',
        'spirit(config):rw'
      ]
    }, name => ({
      get currentLife(){
        return getCurrentLife(name);
      }
    }));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id:'1234abcd'
      })
    });
    yield getCurrentLife.called(descartes.withArgs('db'));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id:'abcd1234'
      })
    });
    yield getCurrentLife.called(descartes.withArgs('config'));

    (yield result).should.deep.equal({
      name: 'test_v2',
      Image: 'nginx:latest',
      Env: [],
      Volumes: {},
      Labels: {
        'samsara.spirit.name': 'test',
        'samsara.spirit.life': '2'
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [
          'db',
          'config:ro',
          '1234abcd',
          'abcd1234:rw'
        ],
        PortBindings: {}
      }
    });
  }));
});