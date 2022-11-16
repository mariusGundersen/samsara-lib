import { Jar, withArgs } from "descartes";
import { beforeEach, describe, it } from "node:test";
import "../../test/common.js";
import stopBeforeStart from "./stopBeforeStart.js";

describe("stopBeforeStart", () => {
  it("should be a function", () => {
    stopBeforeStart.should.be.a("Function");
  });

  describe("when called", () => {
    let startSpy, stopSpy, restartSpy, logSpy, stageSpy;
    beforeEach(() => {
      const jar = new Jar();
      startSpy = jar.probe("containerToStart.start");
      stopSpy = jar.probe("containerToStop.stop");
      restartSpy = jar.probe("containerToStop.start");
      logSpy = jar.sensor("log.message");
      stageSpy = jar.sensor("log.stage");
    });

    it("should do things in the right order", async () => {
      stopBeforeStart(
        { stop: stopSpy, id: "stopId" },
        { start: startSpy, id: "startId" },
        { message: logSpy, stage: stageSpy }
      );

      await logSpy.called(withArgs("Stopping previous container"));

      await stopSpy.called();

      await logSpy.called(withArgs("Container stopId stopped"));

      await stageSpy.called();

      await logSpy.called(withArgs("Starting new container"));

      await startSpy.called();

      await logSpy.called(withArgs("Container startId started"));
    });

    describe("without a container to stop", () => {
      it("should not attempt to stop it", async () => {
        stopBeforeStart(
          null,
          { start: startSpy, id: "startId" },
          { message: logSpy, stage: stageSpy }
        );

        await logSpy.called(withArgs("No container to stop"));

        await stageSpy.called();

        await logSpy.called(withArgs("Starting new container"));

        await startSpy.called();

        await logSpy.called(withArgs("Container startId started"));
      });

      describe("and starting fails", () => {
        it("should not attempt to restart it", async () => {
          const result = stopBeforeStart(
            null,
            { start: startSpy },
            { message: logSpy, stage: stageSpy }
          );

          await logSpy.called(withArgs("No container to stop"));

          await stageSpy.called();

          await logSpy.called(withArgs("Starting new container"));

          startSpy.rejects(new Error());
          await startSpy.called();

          await logSpy.called(withArgs("Could not start new container"));

          try {
            await result;
          } catch (e) {
            e.should.be.a("Error");
          }
        });
      });
    });

    describe("and stopping fails", () => {
      it("should abort", async () => {
        const result = stopBeforeStart(
          { stop: stopSpy },
          { start: startSpy },
          { message: logSpy, stage: stageSpy }
        );

        await logSpy.called(withArgs("Stopping previous container"));

        stopSpy.rejects(new Error());
        await stopSpy.called();

        try {
          await result;
        } catch (e) {
          e.should.be.a("Error");
        }
      });
    });

    describe("and starting fails", () => {
      it("should attempt to restart the stop container", async () => {
        const result = stopBeforeStart(
          { stop: stopSpy, start: restartSpy, id: "stopId" },
          { start: startSpy },
          { message: logSpy, stage: stageSpy }
        );

        await logSpy.called(withArgs("Stopping previous container"));

        await stopSpy.called();

        await logSpy.called(withArgs("Container stopId stopped"));

        await stageSpy.called();

        await logSpy.called(withArgs("Starting new container"));

        startSpy.rejects(new Error());
        await startSpy.called();

        await logSpy.called(withArgs("Could not start new container"));

        await logSpy.called();

        await logSpy.called(withArgs("Attempting to rollback"));

        await logSpy.called(withArgs("Starting previous container"));

        await restartSpy.called();

        await logSpy.called(withArgs("Previous container started"));

        try {
          await result;
        } catch (e) {
          e.should.be.a("Error");
        }
      });
    });

    describe("and restarting fails", () => {
      it("should attempt to restart the stop container", async () => {
        const result = stopBeforeStart(
          { stop: stopSpy, start: restartSpy, id: "stopId" },
          { start: startSpy },
          { message: logSpy, stage: stageSpy }
        );

        await logSpy.called(withArgs("Stopping previous container"));

        await stopSpy.called();

        await logSpy.called(withArgs("Container stopId stopped"));

        await stageSpy.called();

        await logSpy.called(withArgs("Starting new container"));

        startSpy.rejects(new Error());
        await startSpy.called();

        await logSpy.called(withArgs("Could not start new container"));

        await logSpy.called();

        await logSpy.called(withArgs("Attempting to rollback"));

        await logSpy.called(withArgs("Starting previous container"));

        restartSpy.rejects(new Error());
        await restartSpy.called();

        await logSpy.called(
          withArgs("Failed to rollback to previous container")
        );

        await logSpy.called();

        try {
          await result;
        } catch (e) {
          e.should.be.a("Error");
          e.innerException.should.be.an("Error");
        }
      });
    });
  });
});
