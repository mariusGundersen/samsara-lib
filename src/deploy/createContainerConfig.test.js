import { probe, withArgs } from "descartes";
import ContainerConfig from "../ContainerConfig.js";
import createContainerConfig from "./createContainerConfig.js";

import u from "untab";

describe("createContainerConfig", function () {
  it("should be a function", function () {
    createContainerConfig.should.be.a("Function");
  });

  it("should have the image and name", async function () {
    const result = await createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
    `
      ),
      (_) => _
    );

    result.should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct environment as array values", async function () {
    const result = await createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        environment:
          - 'VIRTUAL_HOST=mariusgundersen.net'
    `
      ),
      (_) => _
    );

    result.should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: ["VIRTUAL_HOST=mariusgundersen.net"],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct volumes values", async function () {
    const result = await createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        volumes:
          - '/anonymous/volume'
          - '/host/path:/container/path'
          - 'named-volume:/path/on/container'
          - '/path/on/host:/read/only/volume:ro'
    `
      ),
      (_) => _
    );

    result.should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {
        "/anonymous/volume": {},
        "/container/path": {},
        "/path/on/container": {},
        "/read/only/volume": {},
      },
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [],
        Binds: [
          "/host/path:/container/path",
          "named-volume:/path/on/container",
          "/path/on/host:/read/only/volume:ro",
        ],
        VolumesFrom: [],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct links values", async function () {
    const getCurrentLife = probe("getCurrentLife");

    const result = createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        links:
          - 'service:alias'
          - 'service'
          - 'spirit(db):database'
          - 'spirit(db)'
    `
      ),
      (name) => ({
        get currentLife() {
          return getCurrentLife(name);
        },
      })
    );

    getCurrentLife.resolves({
      container: Promise.resolve({
        id: "1234abcd",
      }),
    });
    await getCurrentLife.called(withArgs("db"));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id: "abcd1234",
      }),
    });
    await getCurrentLife.called(withArgs("db"));

    (await result).should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [
          "service:alias",
          "service:service",
          "1234abcd:database",
          "abcd1234:db",
        ],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct labels values", async function () {
    const result = createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        labels:
          - "com.example.description=Accounting webapp"
          - "com.example.department=Finance"
          - "com.example.label-with-empty-value"
    `
      ),
      (_) => _
    );

    (await result).should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
        "com.example.description": "Accounting webapp",
        "com.example.department": "Finance",
        "com.example.label-with-empty-value": "",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct port bindings", async function () {
    const result = await createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        ports:
          - '80'
          - '80:70/tcp'
          - '127.0.0.1:90:8080/udp'
          - '127.0.0.1:90:8080/tcpudp'
    `
      ),
      (_) => _
    );

    result.should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {
        "80/tcpudp": {},
        "70/tcp": {},
        "8080/tcpudp": {},
        "8080/udp": {},
      },
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: [],
        PortBindings: {
          "80/tcpudp": [],
          "70/tcp": [{ HostPort: "80" }],
          "8080/udp": [{ HostPort: "90", HostIp: "127.0.0.1" }],
          "8080/tcpudp": [{ HostPort: "90", HostIp: "127.0.0.1" }],
        },
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });

  it("should have the correct volumesFrom values", async function () {
    const getCurrentLife = probe("getCurrentLife");

    const result = createContainerConfig(
      "test",
      2,
      new ContainerConfig(
        "test",
        u`
      test:
        image: 'nginx:latest'
        volumes_from:
          - 'db'
          - 'config:ro'
          - 'spirit(db)'
          - 'spirit(config):ro'
    `
      ),
      (name) => ({
        get currentLife() {
          return getCurrentLife(name);
        },
      })
    );

    getCurrentLife.resolves({
      container: Promise.resolve({
        id: "1234abcd",
      }),
    });
    await getCurrentLife.called(withArgs("db"));

    getCurrentLife.resolves({
      container: Promise.resolve({
        id: "abcd1234",
      }),
    });
    await getCurrentLife.called(withArgs("config"));

    (await result).should.deep.equal({
      name: "test_v2",
      Image: "nginx:latest",
      Env: [],
      Volumes: {},
      Labels: {
        "samsara.spirit.name": "test",
        "samsara.spirit.life": "2",
      },
      ExposedPorts: {},
      HostConfig: {
        Links: [],
        Binds: [],
        VolumesFrom: ["db", "config:ro", "1234abcd", "abcd1234:ro"],
        PortBindings: {},
        RestartPolicy: {
          Name: "",
          MaximumRetryCount: 0,
        },
      },
    });
  });
});
