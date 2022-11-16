import { Jar, withArgs } from "descartes";
import { afterEach, beforeEach, describe, it } from "node:test";
import sinon from "sinon";
import "../../test/common.js";
import startBeforeStop from "./startBeforeStop.js";

describe("startBeforeStop", () => {
  it("should be a function", () => {
    startBeforeStop.should.be.a("Function");
  });

  describe("when called", () => {
    let clock, startSpy, stopSpy, logSpy, stageSpy;
    beforeEach(() => {
      const jar = new Jar();
      clock = sinon.useFakeTimers();
      startSpy = jar.probe("container.start");
      stopSpy = jar.probe("container.stop");
      logSpy = jar.sensor("log.message");
      stageSpy = jar.sensor("log.stage");
    });

    afterEach(() => {
      clock.restore();
    });

    it("should do things in the right order", async () => {
      const result = startBeforeStop(
        { start: startSpy, id: "startId" },
        { stop: stopSpy, id: "stopId" },
        { message: logSpy, stage: stageSpy }
      );

      await logSpy.called(withArgs("Starting new container"));

      await startSpy.called();

      await logSpy.called(withArgs("Container startId started"));

      await stageSpy.called();

      await logSpy.called(withArgs("Waiting 5 seconds"));

      clock.tick(5000);

      await logSpy.called(withArgs("Waited 5 seconds"));

      await logSpy.called(withArgs("Stopping previous container"));

      await stopSpy.called();

      await logSpy.called(withArgs("Container stopId stopped"));
    });
  });

  describe("when called without any container to stop", () => {
    let clock, startSpy, stopSpy, logSpy, stageSpy;
    beforeEach(() => {
      const jar = new Jar();
      clock = sinon.useFakeTimers();
      startSpy = jar.probe();
      stopSpy = jar.sensor();
      logSpy = jar.sensor();
      stageSpy = jar.sensor();
    });

    afterEach(() => {
      clock.restore();
    });

    it("should do things in the right order", async () => {
      const result = startBeforeStop({ start: startSpy, id: "startId" }, null, {
        message: logSpy,
        stage: stageSpy,
      });

      await logSpy.called(withArgs("Starting new container"));

      await startSpy.called();

      await logSpy.called(withArgs("Container startId started"));

      await stageSpy.called();

      await logSpy.called(withArgs("No container to stop"));
    });
  });
});
