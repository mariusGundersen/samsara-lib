import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import u from "untab";
import "../test/common.js";
import Spirit from "./Spirit.js";

describe("the Spirit", () => {
  it("should export a constructor function", () => {
    Spirit.should.be.an.instanceOf(Function);
  });

  describe("instance", () => {
    let instance,
      docker = {
        listContainers: sinon.stub(),
      };

    beforeEach(() => {
      instance = new Spirit("test", docker);
    });

    afterEach(() => {
      docker.listContainers.reset();
    });

    it("should be a Spirit", () => {
      instance.should.be.an.instanceOf(Spirit);
    });

    describe("isDeploying", () => {
      beforeEach(async () => {
        sinon.stub(fs, "access").resolves();

        because: {
          await instance.isDeploying;
        }
      });

      afterEach(() => {
        fs.access.restore();
      });

      it("should check if the right file exists", () => {
        fs.access.should.have.been.calledWith(
          path.normalize("config/spirits/test/deploy.lock")
        );
      });
    });

    describe("containerConfig", () => {
      let result;

      beforeEach(async () => {
        sinon.stub(fs, "readFile").returns(
          Promise.resolve(u`
            test:
              image: nginx:latest
            `)
        );

        because: {
          result = await instance.containerConfig;
        }
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      it("should read the correct file", () => {
        fs.readFile.should.have.been.calledWith(
          path.normalize("config/spirits/test/containerConfig.yml")
        );
      });
    });

    describe("settings", () => {
      let result;

      beforeEach(async () => {
        sinon
          .stub(fs, "readFile")
          .returns(Promise.resolve(JSON.stringify({ name: "test" })));

        because: {
          result = await instance.settings;
        }
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      it("should read the correct file", () => {
        fs.readFile.should.have.been.calledWith(
          path.normalize("config/spirits/test/settings.json")
        );
      });

      it("should return json", () => {
        result.should.deep.equal({ name: "test" });
      });

      describe("mutate", () => {
        beforeEach(async () => {
          sinon.stub(fs, "writeFile").returns(Promise.resolve());

          because: {
            result = await instance.mutateSettings(
              (settings) => (settings.name = "hello")
            );
          }
        });

        it("should read the correct file", () => {
          fs.readFile.should.have.been.calledWith(
            path.normalize("config/spirits/test/settings.json")
          );
        });

        it("should write the correct file and content", () => {
          fs.writeFile.should.have.been.calledWith(
            path.normalize("config/spirits/test/settings.json"),
            JSON.stringify({ name: "hello" }, null, "  ")
          );
        });

        afterEach(() => {
          fs.writeFile.restore();
        });
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
            '{"label":["samsara.spirit.life","samsara.spirit.name=test"],"status":["running"]}',
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
            '{"label":["samsara.spirit.life","samsara.spirit.name=test"],"status":["running"]}',
        });
      });

      it("should be stopped", () => {
        result.should.deep.equal("running");
      });
    });
  });
});
