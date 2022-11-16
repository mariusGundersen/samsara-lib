import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import "../test/common.js";
import Life from "./Life.js";

describe("the Life", () => {
  it("should export a constructor function", () => {
    Life.should.be.an.instanceOf(Function);
  });

  describe("instance", () => {
    let instance,
      docker = {
        listContainers: sinon.stub(),
        getContainer: sinon.stub(),
      };

    beforeEach(() => {
      instance = new Life("test", "1", docker);
    });

    afterEach(() => {
      docker.listContainers.reset();
      docker.getContainer.reset();
    });

    it("should be a Life", () => {
      instance.should.be.an.instanceOf(Life);
    });

    describe("containerConfig", () => {
      let result;

      beforeEach(async () => {
        sinon.stub(fs, "readFile").returns(Promise.resolve(`test:`));

        because: {
          result = await instance.containerConfig;
        }
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      it("should read the correct file", () => {
        fs.readFile.should.have.been.calledWith(
          path.normalize("config/spirits/test/lives/1/containerConfig.yml")
        );
      });

      it("should return yaml", () => {
        result.should.equal(`test:`);
      });
    });

    describe("container", () => {
      let result;

      beforeEach(async () => {
        docker.listContainers.returns(Promise.resolve([{ Id: "abcd123" }]));

        docker.getContainer.returns(
          Promise.resolve({
            id: "abcd123",
          })
        );

        because: {
          result = await instance.container;
        }
      });

      it("should filter correctly", () => {
        docker.listContainers.should.have.been.calledWith({
          all: true,
          filters:
            '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"]}',
        });
      });

      it("should get the right container", () => {
        docker.getContainer.should.have.been.calledWith("abcd123");
      });

      it("should return the container", () => {
        result.should.deep.equal({ id: "abcd123" });
      });
    });

    describe("status stopped", () => {
      let result;

      beforeEach(async () => {
        docker.listContainers.returns(Promise.resolve([]));

        because: {
          result = await instance.status;
        }
      });

      it("should filter correctly", () => {
        docker.listContainers.should.have.been.calledWith({
          filters:
            '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"],"status":["running"]}',
        });
      });

      it("should be stopped", () => {
        result.should.deep.equal("stopped");
      });
    });

    describe("status running", () => {
      let result;

      beforeEach(async () => {
        docker.listContainers.returns(Promise.resolve([{}]));

        because: {
          result = await instance.status;
        }
      });

      it("should filter correctly", () => {
        docker.listContainers.should.have.been.calledWith({
          filters:
            '{"label":["samsara.spirit.life=1","samsara.spirit.name=test"],"status":["running"]}',
        });
      });

      it("should be stopped", () => {
        result.should.deep.equal("running");
      });
    });
  });
});
