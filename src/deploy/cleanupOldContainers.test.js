import sinon from "sinon";
import cleanupOldContainers from "./cleanupOldContainers.js";

describe("cleanupOldContainers", function () {
  it("should be a function", function () {
    cleanupOldContainers.should.be.a("Function");
  });

  describe("when called with no lives", function () {
    beforeEach(function () {
      this.logSpy = sinon.spy();
    });

    it("should report that there is nothing to do", async function () {
      await cleanupOldContainers([], 0, null, this.logSpy);

      this.logSpy.should.have.been.calledWith("Removing 0 old containers");

      this.logSpy.should.have.been.calledWith("Removing 0 old images");
    });
  });

  describe("when called with no lives belov the limit", function () {
    beforeEach(function () {
      this.logSpy = sinon.spy();
      this.lives = [{ life: 1 }];
    });

    it("should report that there is nothing to do", async function () {
      await cleanupOldContainers(this.lives, 0, null, this.logSpy);

      this.logSpy.should.have.been.calledWith("Removing 0 old containers");

      this.logSpy.should.have.been.calledWith("Removing 0 old images");
    });
  });

  describe("when called with one life belov the limit", function () {
    beforeEach(
      setup({
        image: {
          async remove() {},
        },
        container: {
          id: "12345abcde",
          inspect: { Image: "abcde12345" },
          async remove() {},
        },
        lives: [
          {
            life: 1,
          },
        ],
      })
    );

    it("should report which containers and images have been removed", async function () {
      await cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);

      this.logSpy.should.have.been.calledWith("Removing 1 old containers");

      this.logSpy.should.have.been.calledWith("Removing container 12345abcde");

      this.container.remove.should.have.been.calledWith({ v: true });

      this.logSpy.should.have.been.calledWith("Removed container 12345abcde");

      this.docker.getImage.should.have.been.calledWith("abcde12345");

      this.logSpy.should.have.been.calledWith("Removing 1 old images");

      this.logSpy.should.have.been.calledWith("Removing image abcde12345");

      this.image.remove.should.have.been.calledWith();

      this.logSpy.should.have.been.calledWith("Removed image abcde12345");
    });
  });

  describe("when removing container fails", function () {
    beforeEach(
      setup({
        image: {
          async remove() {},
        },
        container: {
          id: "12345abcde",
          inspect: { Image: "abcde12345" },
          async remove() {
            throw new Error("please fail");
          },
        },
        lives: [
          {
            life: 1,
          },
        ],
      })
    );

    it("should not fail but report the failure", async function () {
      await cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);

      this.logSpy.should.have.been.calledWith("Removing 1 old containers");

      this.logSpy.should.have.been.calledWith("Removing container 12345abcde");

      this.container.remove.should.have.been.calledWith({ v: true });

      this.logSpy.should.not.have.been.calledWith(
        "Removed container 12345abcde"
      );

      this.logSpy.should.have.been.calledWith(
        "Failed to remove container 12345abcde"
      );

      this.docker.getImage.should.have.been.calledWith("abcde12345");

      this.logSpy.should.have.been.calledWith("Removing 1 old images");

      this.logSpy.should.have.been.calledWith("Removing image abcde12345");

      this.image.remove.should.have.been.calledWith();

      this.logSpy.should.have.been.calledWith("Removed image abcde12345");
    });
  });

  describe("when removing image fails", function () {
    beforeEach(
      setup({
        image: {
          async remove() {
            throw new Error("oh noes");
          },
        },
        container: {
          id: "12345abcde",
          inspect: { Image: "abcde12345" },
          async remove() {},
        },
        lives: [
          {
            life: 1,
          },
        ],
      })
    );

    it("should not fail but report the failure", async function () {
      await cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);

      this.logSpy.should.have.been.calledWith("Removing 1 old containers");

      this.logSpy.should.have.been.calledWith("Removing container 12345abcde");

      this.container.remove.should.have.been.calledWith({ v: true });

      this.logSpy.should.have.been.calledWith("Removed container 12345abcde");

      this.docker.getImage.should.have.been.calledWith("abcde12345");

      this.logSpy.should.have.been.calledWith("Removing 1 old images");

      this.logSpy.should.have.been.calledWith("Removing image abcde12345");

      this.image.remove.should.have.been.calledWith();

      this.logSpy.should.not.have.been.calledWith("Removed image abcde12345");

      this.logSpy.should.have.been.calledWith(
        "Failed to remove image abcde12345"
      );
    });
  });
});

function setup(config) {
  return function () {
    this.logSpy = sinon.spy();
    var image = (this.image = {
      remove: sinon.spy(config.image.remove),
    });

    var container = (this.container = {
      id: config.container.id,
      inspect: sinon.stub().returns(Promise.resolve(config.container.inspect)),
      remove: sinon.spy(config.container.remove),
    });

    this.lives = config.lives.map((life) => ({
      life: life.life,
      get container() {
        return Promise.resolve(container);
      },
    }));

    this.docker = {
      getImage: sinon.stub().returns(image),
    };
  };
}
