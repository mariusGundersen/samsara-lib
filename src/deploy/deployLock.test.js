import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import "../../test/common.js";
import { lock, unlock } from "./deployLock.js";

describe("deployLock", () => {
  it("should have a lock method", () => {
    lock.should.exist;
  });

  it("should have an unlock method", () => {
    unlock.should.exist;
  });

  describe("lock", () => {
    beforeEach(() => {
      sinon.stub(fs, "open").returns(Promise.resolve("file"));

      sinon.stub(fs, "writeFile").returns(Promise.resolve());

      because: {
        return lock("test");
      }
    });

    afterEach(() => {
      fs.open.restore();
      fs.writeFile.restore();
    });

    it("should open the right path with wx", () => {
      fs.open.should.have.been.calledWith(
        path.join("config", "spirits", "test", "deploy.lock"),
        "wx"
      );
    });

    it("should write the current date to the string", () => {
      fs.writeFile.should.have.been.calledWith(
        "file",
        sinon.match((date) => Date.parse(date)),
        0,
        "utf8"
      );
    });
  });

  describe("unlock", () => {
    beforeEach(() => {
      sinon.stub(fs, "unlink").returns(Promise.resolve());

      because: {
        return unlock("test");
      }
    });

    afterEach(() => {
      fs.unlink.restore();
    });

    it("should unlink the right path", () => {
      fs.unlink.should.have.been.calledWith(
        path.join("config", "spirits", "test", "deploy.lock")
      );
    });
  });
});
