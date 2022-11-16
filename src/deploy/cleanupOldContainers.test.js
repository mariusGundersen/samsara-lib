import { beforeEach, describe, it } from "node:test";
import sinon from "sinon";
import "../../test/common.js";
import cleanupOldContainers from "./cleanupOldContainers.js";

describe("cleanupOldContainers", () => {
  it("should be a function", () => {
    cleanupOldContainers.should.be.a("Function");
  });

  describe("when called with no lives", () => {
    let logSpy;
    beforeEach(() => {
      logSpy = sinon.spy();
    });

    it("should report that there is nothing to do", async () => {
      await cleanupOldContainers([], 0, null, logSpy);

      logSpy.should.have.been.calledWith("Removing 0 old containers");

      logSpy.should.have.been.calledWith("Removing 0 old images");
    });
  });

  describe("when called with no lives belov the limit", () => {
    let logSpy, lives;
    beforeEach(() => {
      logSpy = sinon.spy();
      lives = [{ life: 1 }];
    });

    it("should report that there is nothing to do", async () => {
      await cleanupOldContainers(lives, 0, null, logSpy);

      logSpy.should.have.been.calledWith("Removing 0 old containers");

      logSpy.should.have.been.calledWith("Removing 0 old images");
    });
  });

  describe("when called with one life belov the limit", () => {
    let logSpy, image, container, lives, docker;
    beforeEach(() => {
      logSpy = sinon.spy();
      image = {
        remove: sinon.spy(),
      };
      container = {
        id: "12345abcde",
        inspect: sinon.stub().resolves({ Image: "abcde12345" }),
        remove: sinon.spy(),
      };
      lives = [
        {
          life: 1,
          get container() {
            return Promise.resolve(container);
          },
        },
      ];
      docker = {
        getImage: sinon.stub().returns(image),
      };
    });

    it("should report which containers and images have been removed", async () => {
      await cleanupOldContainers(lives, 2, docker, logSpy);

      logSpy.should.have.been.calledWith("Removing 1 old containers");

      logSpy.should.have.been.calledWith("Removing container 12345abcde");

      container.remove.should.have.been.calledWith({ v: true });

      logSpy.should.have.been.calledWith("Removed container 12345abcde");

      docker.getImage.should.have.been.calledWith("abcde12345");

      logSpy.should.have.been.calledWith("Removing 1 old images");

      logSpy.should.have.been.calledWith("Removing image abcde12345");

      image.remove.should.have.been.calledWith();

      logSpy.should.have.been.calledWith("Removed image abcde12345");
    });
  });

  describe("when removing container fails", () => {
    let logSpy, image, container, lives, docker;
    beforeEach(() => {
      logSpy = sinon.spy();
      image = {
        remove: sinon.spy(),
      };
      container = {
        id: "12345abcde",
        inspect: sinon.stub().resolves({ Image: "abcde12345" }),
        remove: sinon.stub().rejects("please fail"),
      };
      lives = [
        {
          life: 1,
          get container() {
            return Promise.resolve(container);
          },
        },
      ];
      docker = {
        getImage: sinon.stub().returns(image),
      };
    });

    it("should not fail but report the failure", async () => {
      await cleanupOldContainers(lives, 2, docker, logSpy);

      logSpy.should.have.been.calledWith("Removing 1 old containers");

      logSpy.should.have.been.calledWith("Removing container 12345abcde");

      container.remove.should.have.been.calledWith({ v: true });

      logSpy.should.not.have.been.calledWith("Removed container 12345abcde");

      logSpy.should.have.been.calledWith(
        "Failed to remove container 12345abcde"
      );

      docker.getImage.should.have.been.calledWith("abcde12345");

      logSpy.should.have.been.calledWith("Removing 1 old images");

      logSpy.should.have.been.calledWith("Removing image abcde12345");

      image.remove.should.have.been.calledWith();

      logSpy.should.have.been.calledWith("Removed image abcde12345");
    });
  });

  describe("when removing image fails", () => {
    let logSpy, image, container, lives, docker;
    beforeEach(() => {
      logSpy = sinon.spy();
      image = {
        remove: sinon.stub().rejects("oh noes"),
      };
      container = {
        id: "12345abcde",
        inspect: sinon.stub().resolves({ Image: "abcde12345" }),
        remove: sinon.spy(),
      };
      lives = [
        {
          life: 1,
          get container() {
            return Promise.resolve(container);
          },
        },
      ];
      docker = {
        getImage: sinon.stub().returns(image),
      };
    });

    it("should not fail but report the failure", async () => {
      await cleanupOldContainers(lives, 2, docker, logSpy);

      logSpy.should.have.been.calledWith("Removing 1 old containers");

      logSpy.should.have.been.calledWith("Removing container 12345abcde");

      container.remove.should.have.been.calledWith({ v: true });

      logSpy.should.have.been.calledWith("Removed container 12345abcde");

      docker.getImage.should.have.been.calledWith("abcde12345");

      logSpy.should.have.been.calledWith("Removing 1 old images");

      logSpy.should.have.been.calledWith("Removing image abcde12345");

      image.remove.should.have.been.calledWith();

      logSpy.should.not.have.been.calledWith("Removed image abcde12345");

      logSpy.should.have.been.calledWith("Failed to remove image abcde12345");
    });
  });
});
