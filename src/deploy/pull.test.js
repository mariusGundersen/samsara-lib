import { Jar, withArgs, withExactArgs } from "descartes";
import { beforeEach, describe, it } from "node:test";
import "../../test/common.js";
import pull from "./pull.js";

describe("pull", () => {
  it("should be a function", () => {
    pull.should.be.a("Function");
  });

  describe("when called", () => {
    let logSpy, stream, docker;
    beforeEach(() => {
      const jar = new Jar();
      logSpy = jar.sensor("log");
      stream = {};
      docker = {
        pull: jar.probe("pull"),
        $subject: {
          modem: {
            followProgress: jar.sensor("followProgress"),
          },
        },
      };
    });

    it("pull the image", async () => {
      const test = pull("test:latest", docker, logSpy);

      await logSpy.called(withExactArgs("Pulling image test:latest"));

      docker.pull.resolves(stream);
      await docker.pull.called(withExactArgs("test:latest"));

      const call = await docker.$subject.modem.followProgress.called(
        withArgs(stream)
      );
      call.args[1](null, true);

      await logSpy.called(withExactArgs("Pulled image test:latest"));

      return await test;
    });
  });
});
