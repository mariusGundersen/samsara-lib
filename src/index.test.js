import samsara from "./index.js";

describe("the module", function () {
  it("should export a function", function () {
    expect(samsara).to.be.an.instanceOf(Function);
  });

  describe("instance", function () {
    let instance;

    beforeEach(function () {
      instance = samsara({
        docker: {},
      });
    });

    it("should be an object", function () {
      instance.should.be.an.instanceOf(Object);
    });

    it("should have a way to get all spirits", function () {
      instance.spirits.should.be.an.instanceOf(Function);
    });

    it("should have a way to get one spirit", function () {
      instance.spirit.should.be.an.instanceOf(Function);
    });

    it("should have a way to create a spirit", function () {
      instance.createSpirit.should.be.an.instanceOf(Function);
    });

    it("should have a way to upgrade the config", function () {
      instance.upgrade.should.be.an.instanceOf(Function);
    });
  });
});
