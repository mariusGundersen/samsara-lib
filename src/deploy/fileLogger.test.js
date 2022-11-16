import { afterEach, beforeEach, describe, it } from "node:test";
import sinon from "sinon";
import "../../test/common.js";

import { Jar, withArgs } from "descartes";
import fs from "fs/promises";
import u from "untab";
import fileLogger from "./fileLogger.js";

describe("fileLogger", () => {
  it("should be a function", () => {
    fileLogger.should.be.a("Function");
  });

  describe.skip("when called", function () {
    beforeEach(() => {
      const jar = (this.jar = new Jar());
      this.clock = sinon.useFakeTimers();
      this.onSpy = jar.sensor("eventEmitter.on");
      this.createWriteStreamSpy = jar.probe("createWriteStream");
      this.writeFileSpy = jar.probe("writeFile");
      this.writeSpy = jar.sensor("fileStream.write");
      this.endSpy = jar.sensor("fileStream.end");
      sinon.stub(fs, "createWriteStream").callsFake(this.createWriteStreamSpy);
      sinon.stub(fs, "writeFile").callsFake(this.writeFileSpy);
    });

    afterEach(() => {
      this.clock.restore();
      fs.createWriteStream.restore();
      fs.writeFile.restore();
    });

    it("should do things in the right order", async () => {
      const result = fileLogger({ on: this.onSpy });

      const startCall = await this.onSpy.called(withArgs("start"));
      const stageCall = await this.onSpy.called(withArgs("stage"));
      const messageCall = await this.onSpy.called(withArgs("message"));
      const stopCall = await this.onSpy.called(withArgs("stop"));

      const onStart = startCall.args[1];
      const onStage = stageCall.args[1];
      const onMessage = messageCall.args[1];
      const onStop = stopCall.args[1];

      onStart({
        spirit: "test",
        life: 12,
        containerConfig: { image: "nginx:latest" },
      });

      await this.writeFileSpy.called(
        withArgs(
          "config/spirits/test/lives/12/containerConfig.yml",
          u`
        test:
          image: 'nginx:latest'
        `
        )
      );

      this.createWriteStreamSpy.resolves({
        write: this.writeSpy,
        end: this.endSpy,
      });
      await this.createWriteStreamSpy.called(
        withArgs("config/spirits/test/lives/12/deploy.log")
      );

      await this.writeSpy.called();

      this.jar.done();
    });
  });
});
