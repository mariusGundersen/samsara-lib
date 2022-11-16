import fs from "fs/promises";
import path from "path";
import sinon from "sinon";
import { lock, unlock } from "./deployLock.js";

describe("deployLock", function () {
  it("should have a lock method", function () {
    lock.should.exist;
  });

  it("should have an unlock method", function () {
    unlock.should.exist;
  });

  describe("lock", function () {
    beforeEach(function () {
      sinon.stub(fs, "open").returns(Promise.resolve("file"));

      sinon.stub(fs, "writeFile").returns(Promise.resolve());

      because: {
        return lock("test");
      }
    });

    afterEach(function () {
      fs.open.restore();
      fs.writeFile.restore();
    });

    it("should open the right path with wx", function () {
      fs.open.should.have.been.calledWith(
        path.join("config", "spirits", "test", "deploy.lock"),
        "wx"
      );
    });

    it("should write the current date to the string", function () {
      fs.writeFile.should.have.been.calledWith(
        "file",
        sinon.match((date) => Date.parse(date)),
        0,
        "utf8"
      );
    });
  });

  describe("unlock", function () {
    beforeEach(function () {
      sinon.stub(fs, "unlink").returns(Promise.resolve());

      because: {
        return unlock("test");
      }
    });

    afterEach(function () {
      fs.unlink.restore();
    });

    it("should unlink the right path", function () {
      fs.unlink.should.have.been.calledWith(
        path.join("config", "spirits", "test", "deploy.lock")
      );
    });
  });
});
