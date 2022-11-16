import { beforeEach, describe, it } from "node:test";
import "../../test/common.js";
import createLogger from "./createLogger.js";

describe("createLogger", () => {
  it("should be a function", () => {
    createLogger.should.be.a("Function");
    createLogger.length.should.equal(1);
  });

  describe("when called", () => {
    let logger;
    beforeEach(() => {
      logger = createLogger("something");
    });

    it("should have an eventEmitter", () => {
      logger.eventEmitter.should.exist;
    });

    it("should emit the right plan", (done) => {
      logger.eventEmitter.on("start", (event) => {
        event.spirit.should.equal("something");
        event.life.should.equal(15);
        event.plan.should.deep.equal(["test", "done"]);
        event.containerConfig.should.deep.equal({});
        done();
      });

      logger.start(15, ["test", "done"], {});
    });

    it("should emit the right message", (done) => {
      logger.eventEmitter.on("message", (event) => {
        event.spirit.should.equal("something");
        event.message.should.equal("hello");
        done();
      });

      logger.message("hello");
    });

    it("should emit the right stage", (done) => {
      logger.eventEmitter.on("stage", (event) => {
        event.spirit.should.equal("something");
        done();
      });

      logger.stage("hello");
    });

    it("should emit the right end", (done) => {
      logger.eventEmitter.on("stop", (event) => {
        event.spirit.should.equal("something");
        event.error.should.deep.equal({});
        done();
      });

      logger.stop({});
    });
  });
});
