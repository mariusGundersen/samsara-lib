import { describe, it } from "node:test";
import "../../test/common.js";
import { deploy, revive } from "./createPlan.js";

describe("createPlan", () => {
  it("should have a method for creating a deploy plan", () => {
    deploy.should.exist;
  });

  it("should have a method for creating a reincarnation plan", () => {
    revive.should.exist;
  });

  describe("deploy", () => {
    describe("without cleanupLimit", () => {
      it("should have 4 items", () => {
        deploy({}).length.should.equal(4);
      });

      it("should have the right order", () => {
        deploy({}).should.eql(["pull", "create", "start", "stop"]);
      });
    });

    describe("with cleanupLimit greater than 0", () => {
      it("should have 5 items", () => {
        deploy({ cleanupLimit: 5 }).length.should.equal(5);
      });

      it("should have the right order", () => {
        deploy({ cleanupLimit: 5 }).should.eql([
          "pull",
          "create",
          "start",
          "stop",
          "cleanup",
        ]);
      });
    });

    describe("with stop before start", () => {
      it("should have 4 items", () => {
        deploy({ deploymentMethod: "stop-before-start" }).length.should.equal(
          4
        );
      });

      it("should have the right order", () => {
        deploy({ deploymentMethod: "stop-before-start" }).should.eql([
          "pull",
          "create",
          "stop",
          "start",
        ]);
      });
    });
  });

  describe("revive", () => {
    describe("with start before stop", () => {
      it("should have 2 items", () => {
        revive({ deploymentMethod: "start-before-stop" }).length.should.equal(
          2
        );
      });

      it("should have the right order", () => {
        revive({ deploymentMethod: "start-before-stop" }).should.eql([
          "start",
          "stop",
        ]);
      });
    });

    describe("with stop before start", () => {
      it("should have 2 items", () => {
        revive({ deploymentMethod: "stop-before-start" }).length.should.equal(
          2
        );
      });

      it("should have the right order", () => {
        revive({ deploymentMethod: "stop-before-start" }).should.eql([
          "stop",
          "start",
        ]);
      });
    });
  });
});
