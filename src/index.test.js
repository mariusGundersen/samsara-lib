import { beforeEach, describe, it } from "node:test";
import "../test/common.js";
import samsara from "./index.js";

describe("the module", () => {
  it("should export a function", () => {
    expect(samsara).to.be.an.instanceOf(Function);
  });

  describe("instance", () => {
    let instance;

    beforeEach(() => {
      instance = samsara({
        docker: {},
      });
    });

    it("should be an object", () => {
      instance.should.be.an.instanceOf(Object);
    });

    it("should have a way to get all spirits", () => {
      instance.spirits.should.be.an.instanceOf(Function);
    });

    it("should have a way to get one spirit", () => {
      instance.spirit.should.be.an.instanceOf(Function);
    });

    it("should have a way to create a spirit", () => {
      instance.createSpirit.should.be.an.instanceOf(Function);
    });

    it("should have a way to upgrade the config", () => {
      instance.upgrade.should.be.an.instanceOf(Function);
    });
  });
});
