import { describe, it } from "node:test";
import "../../test/common.js";
import statusToState from "./statusToState.js";

describe("statusToState", () => {
  it("Up", () => {
    statusToState("Up 2 days").should.equal("running");
  });

  it("Paused", () => {
    statusToState("Up 2 days (Paused)").should.equal("paused");
  });

  it("Created", () => {
    statusToState("Created").should.equal("created");
  });

  it("Restarting", () => {
    statusToState("Restarting").should.equal("restarting");
  });

  it("Dead", () => {
    statusToState("Dead").should.equal("dead");
  });

  it("Exited", () => {
    statusToState("Exited (1) 13 days ago").should.equal("exited");
  });

  it("should default to Exited", () => {
    statusToState("blablabla").should.equal("exited");
  });
});
