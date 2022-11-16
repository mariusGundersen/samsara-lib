import { Jar, withArgs } from "descartes";
import stopBeforeStart from "./stopBeforeStart.js";

describe("stopBeforeStart", function () {
  it("should be a function", function () {
    stopBeforeStart.should.be.a("Function");
  });

  describe("when called", function () {
    beforeEach(function () {
      const jar = new Jar();
      this.startSpy = jar.probe("containerToStart.start");
      this.stopSpy = jar.probe("containerToStop.stop");
      this.restartSpy = jar.probe("containerToStop.start");
      this.logSpy = jar.sensor("log.message");
      this.stageSpy = jar.sensor("log.stage");
    });

    it("should do things in the right order", async function () {
      stopBeforeStart(
        { stop: this.stopSpy, id: "stopId" },
        { start: this.startSpy, id: "startId" },
        { message: this.logSpy, stage: this.stageSpy }
      );

      await this.logSpy.called(withArgs("Stopping previous container"));

      await this.stopSpy.called();

      await this.logSpy.called(withArgs("Container stopId stopped"));

      await this.stageSpy.called();

      await this.logSpy.called(withArgs("Starting new container"));

      await this.startSpy.called();

      await this.logSpy.called(withArgs("Container startId started"));
    });

    describe("without a container to stop", function () {
      it("should not attempt to stop it", async function () {
        stopBeforeStart(
          null,
          { start: this.startSpy, id: "startId" },
          { message: this.logSpy, stage: this.stageSpy }
        );

        await this.logSpy.called(withArgs("No container to stop"));

        await this.stageSpy.called();

        await this.logSpy.called(withArgs("Starting new container"));

        await this.startSpy.called();

        await this.logSpy.called(withArgs("Container startId started"));
      });

      describe("and starting fails", function () {
        it("should not attempt to restart it", async function () {
          const result = stopBeforeStart(
            null,
            { start: this.startSpy },
            { message: this.logSpy, stage: this.stageSpy }
          );

          await this.logSpy.called(withArgs("No container to stop"));

          await this.stageSpy.called();

          await this.logSpy.called(withArgs("Starting new container"));

          this.startSpy.rejects(new Error());
          await this.startSpy.called();

          await this.logSpy.called(withArgs("Could not start new container"));

          try {
            await result;
          } catch (e) {
            e.should.be.a("Error");
          }
        });
      });
    });

    describe("and stopping fails", function () {
      it("should abort", async function () {
        const result = stopBeforeStart(
          { stop: this.stopSpy },
          { start: this.startSpy },
          { message: this.logSpy, stage: this.stageSpy }
        );

        await this.logSpy.called(withArgs("Stopping previous container"));

        this.stopSpy.rejects(new Error());
        await this.stopSpy.called();

        try {
          await result;
        } catch (e) {
          e.should.be.a("Error");
        }
      });
    });

    describe("and starting fails", function () {
      it("should attempt to restart the stop container", async function () {
        const result = stopBeforeStart(
          { stop: this.stopSpy, start: this.restartSpy, id: "stopId" },
          { start: this.startSpy },
          { message: this.logSpy, stage: this.stageSpy }
        );

        await this.logSpy.called(withArgs("Stopping previous container"));

        await this.stopSpy.called();

        await this.logSpy.called(withArgs("Container stopId stopped"));

        await this.stageSpy.called();

        await this.logSpy.called(withArgs("Starting new container"));

        this.startSpy.rejects(new Error());
        await this.startSpy.called();

        await this.logSpy.called(withArgs("Could not start new container"));

        await this.logSpy.called();

        await this.logSpy.called(withArgs("Attempting to rollback"));

        await this.logSpy.called(withArgs("Starting previous container"));

        await this.restartSpy.called();

        await this.logSpy.called(withArgs("Previous container started"));

        try {
          await result;
        } catch (e) {
          e.should.be.a("Error");
        }
      });
    });

    describe("and restarting fails", function () {
      it("should attempt to restart the stop container", async function () {
        const result = stopBeforeStart(
          { stop: this.stopSpy, start: this.restartSpy, id: "stopId" },
          { start: this.startSpy },
          { message: this.logSpy, stage: this.stageSpy }
        );

        await this.logSpy.called(withArgs("Stopping previous container"));

        await this.stopSpy.called();

        await this.logSpy.called(withArgs("Container stopId stopped"));

        await this.stageSpy.called();

        await this.logSpy.called(withArgs("Starting new container"));

        this.startSpy.rejects(new Error());
        await this.startSpy.called();

        await this.logSpy.called(withArgs("Could not start new container"));

        await this.logSpy.called();

        await this.logSpy.called(withArgs("Attempting to rollback"));

        await this.logSpy.called(withArgs("Starting previous container"));

        this.restartSpy.rejects(new Error());
        await this.restartSpy.called();

        await this.logSpy.called(
          withArgs("Failed to rollback to previous container")
        );

        await this.logSpy.called();

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
