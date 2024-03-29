import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import u from "untab";
import "../test/common.js";
import ContainerConfig from "./ContainerConfig.js";

describe("ContainerConfig", () => {
  it("should toString with the file contents", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
    `
    );
    containerConfig.toString().should.equal("test:\n  image: 'nginx:latest'\n");
  });

  it("should deserialize the file contents", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
    `
    );
    containerConfig.yaml.should.deep.equal({ test: { image: "nginx:latest" } });
  });

  it("should provide the environment variables as an array", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        environment:
          - VIRTUAL_HOST=mariusgundersen.net
    `
    );

    containerConfig.environment.should.deep.equal([
      { key: "VIRTUAL_HOST", value: "mariusgundersen.net" },
    ]);
  });

  it("should provide the image", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
    `
    );

    containerConfig.image.should.equal("nginx");
  });

  it("should provide the tag", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
    `
    );

    containerConfig.tag.should.equal("latest");
  });

  it("should provide the tag even when it is missing", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx'
    `
    );

    containerConfig.tag.should.equal("latest");
  });

  it("should provide the environment variables as an array even when it's an object", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        environment:
          VIRTUAL_HOST: mariusgundersen.net
    `
    );

    containerConfig.environment.should.deep.equal([
      { key: "VIRTUAL_HOST", value: "mariusgundersen.net" },
    ]);
  });

  it("should provide the volumes", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        volumes:
          - '/container/path'
          - '/host/path:/container/path'
          - 'volume-name:/container/path:ro'
    `
    );

    containerConfig.volumes.should.deep.equal([
      { hostPath: "", containerPath: "/container/path", readOnly: false },
      {
        hostPath: "/host/path",
        containerPath: "/container/path",
        readOnly: false,
      },
      {
        hostPath: "volume-name",
        containerPath: "/container/path",
        readOnly: true,
      },
    ]);
  });

  it("should provide the ports", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        ports:
          - '80'
          - '8080:80'
          - '127.0.0.1:8080:80'
          - '80/udp'
          - '81/tcp'
          - '82/tcpudp'
    `
    );

    containerConfig.ports.should.deep.equal([
      { containerPort: "80", hostPort: "", hostIp: "", udp: true, tcp: true },
      {
        containerPort: "80",
        hostPort: "8080",
        hostIp: "",
        udp: true,
        tcp: true,
      },
      {
        containerPort: "80",
        hostPort: "8080",
        hostIp: "127.0.0.1",
        udp: true,
        tcp: true,
      },
      { containerPort: "80", hostPort: "", hostIp: "", udp: true, tcp: false },
      { containerPort: "81", hostPort: "", hostIp: "", udp: false, tcp: true },
      { containerPort: "82", hostPort: "", hostIp: "", udp: true, tcp: true },
    ]);
  });

  it("should provide the links", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        links:
          - 'service'
          - 'service:alias'
          - 'spirit(service)'
          - 'spirit(service):alias'
    `
    );

    containerConfig.links.should.deep.equal([
      { container: "service", spirit: "", alias: "service" },
      { container: "service", spirit: "", alias: "alias" },
      { container: "", spirit: "service", alias: "service" },
      { container: "", spirit: "service", alias: "alias" },
    ]);
  });

  it("should provide the labels", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        labels:
          - "com.example.description=Accounting webapp"
          - "com.example.department=Finance"
          - "com.example.label-with-empty-value"
    `
    );

    containerConfig.labels.should.deep.equal([
      { key: "com.example.description", value: "Accounting webapp" },
      { key: "com.example.department", value: "Finance" },
      { key: "com.example.label-with-empty-value", value: "" },
    ]);
  });

  it("should provide the volumesFrom", () => {
    const containerConfig = new ContainerConfig(
      "test",
      u`
      test:
        image: 'nginx:latest'
        volumes_from:
          - 'service'
          - 'service:ro'
          - 'spirit(service)'
          - 'spirit(service):ro'
    `
    );

    containerConfig.volumesFrom.should.deep.equal([
      { container: "service", spirit: "", readOnly: false },
      { container: "service", spirit: "", readOnly: true },
      { container: "", spirit: "service", readOnly: false },
      { container: "", spirit: "service", readOnly: true },
    ]);
  });

  describe("setters", () => {
    let basicConfig;

    beforeEach(() => {
      basicConfig = new ContainerConfig("test", "test: {}\n");
    });

    it("should set the config", () => {
      basicConfig.config = {
        image: "nginx:1.7",
      };

      basicConfig.config.should.deep.equal({
        image: "nginx:1.7",
      });
    });

    it("should set the image", () => {
      basicConfig.image = "nginx";

      basicConfig.config.should.deep.equal({
        image: "nginx:latest",
      });
    });

    it("should set the image and tag", () => {
      basicConfig.image = "nginx";
      basicConfig.tag = "1.7";

      basicConfig.config.should.deep.equal({
        image: "nginx:1.7",
      });
    });

    it("should set the environment", () => {
      basicConfig.environment = [
        { key: "VIRTUAL_HOST", value: "mariusgundersen.net" },
      ];

      basicConfig.config.environment.should.deep.equal([
        "VIRTUAL_HOST=mariusgundersen.net",
      ]);
    });

    it("should set the volumes", () => {
      basicConfig.volumes = [
        { hostPath: "", containerPath: "/container/path", readOnly: false },
        {
          hostPath: "/host/path",
          containerPath: "/container/path",
          readOnly: false,
        },
        {
          hostPath: "volume-name",
          containerPath: "/container/path",
          readOnly: true,
        },
      ];

      basicConfig.config.volumes.should.deep.equal([
        "/container/path",
        "/host/path:/container/path",
        "volume-name:/container/path:ro",
      ]);
    });

    it("should set the ports", () => {
      basicConfig.ports = [
        { containerPort: "80", hostPort: "", hostIp: "", udp: true, tcp: true },
        {
          containerPort: "80",
          hostPort: "8080",
          hostIp: "",
          udp: true,
          tcp: false,
        },
        {
          containerPort: "80",
          hostPort: "8080",
          hostIp: "127.0.0.1",
          udp: false,
          tcp: true,
        },
      ];

      basicConfig.config.ports.should.deep.equal([
        "80/tcpudp",
        "8080:80/udp",
        "127.0.0.1:8080:80/tcp",
      ]);
    });

    it("should set the links", () => {
      basicConfig.links = [
        { container: "service", spirit: "", alias: "service" },
        { container: "service", spirit: "", alias: "alias" },
        { container: "", spirit: "service", alias: "service" },
        { container: "", spirit: "service", alias: "alias" },
      ];

      basicConfig.config.links.should.deep.equal([
        "service:service",
        "service:alias",
        "spirit(service):service",
        "spirit(service):alias",
      ]);
    });

    it("should set the labels", () => {
      basicConfig.labels = [
        { key: "com.example.description", value: "Accounting webapp" },
        { key: "com.example.department", value: "Finance" },
        { key: "com.example.label-with-empty-value", value: "" },
      ];

      basicConfig.config.labels.should.deep.equal([
        "com.example.description=Accounting webapp",
        "com.example.department=Finance",
        "com.example.label-with-empty-value",
      ]);
    });

    it("should set the volumesFrom", () => {
      basicConfig.volumesFrom = [
        { container: "service", spirit: "", readOnly: false },
        { container: "service", spirit: "", readOnly: true },
        { container: "", spirit: "service", readOnly: false },
        { container: "", spirit: "service", readOnly: true },
      ];

      basicConfig.config.volumes_from.should.deep.equal([
        "service",
        "service:ro",
        "spirit(service)",
        "spirit(service):ro",
      ]);
    });
  });

  describe("saving", () => {
    beforeEach(() => {
      sinon.stub(fs, "writeFile").returns(Promise.resolve());
    });

    afterEach(() => {
      fs.writeFile.restore();
    });

    it("should write the contents of the config to the right file", async () => {
      const containerConfig = new ContainerConfig(
        "test",
        u`
        test:
          image: 'nginx:latest'
      `
      );

      await containerConfig.save();

      fs.writeFile.should.have.been.calledWith(
        path.normalize("config/spirits/test/containerConfig.yml"),
        "test:\n  image: 'nginx:latest'\n"
      );
    });
  });

  describe("saving life", () => {
    beforeEach(() => {
      sinon.stub(fs, "writeFile").returns(Promise.resolve());
    });

    afterEach(() => {
      fs.writeFile.restore();
    });

    it("should write the contents of the config to the right file", async () => {
      const containerConfig = new ContainerConfig(
        "test",
        u`
        test:
          image: 'nginx:latest'
      `
      );

      await containerConfig.saveLife("2");

      fs.writeFile.should.have.been.calledWith(
        path.normalize("config/spirits/test/lives/2/containerConfig.yml"),
        "test:\n  container_name: test_v2\n  image: 'nginx:latest'\n"
      );
    });
  });
});
