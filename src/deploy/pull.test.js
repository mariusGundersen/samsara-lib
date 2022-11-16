import { Jar, withArgs, withExactArgs } from "descartes";
import pull from "./pull.js";

describe("pull", function () {
  it("should be a function", function () {
    pull.should.be.a("Function");
  });

  describe("when called", function () {
    beforeEach(function () {
      const jar = new Jar();
      this.logSpy = jar.sensor("log");
      this.stream = {};
      this.docker = {
        pull: jar.probe("pull"),
        $subject: {
          modem: {
            followProgress: jar.sensor("followProgress"),
          },
        },
      };
    });

    it("pull the image", async function () {
      const test = pull("test:latest", this.docker, this.logSpy);

      await this.logSpy.called(withExactArgs("Pulling image test:latest"));

      this.docker.pull.resolves(this.stream);
      await this.docker.pull.called(withExactArgs("test:latest"));

      const call = await this.docker.$subject.modem.followProgress.called(
        withArgs(this.stream)
      );
      call.args[1](null, true);

      await this.logSpy.called(withExactArgs("Pulled image test:latest"));

      return await test;
    });
  });
});
