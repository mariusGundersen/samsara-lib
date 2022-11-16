import statusToState from "./statusToState.js";

describe("statusToState", function () {
  it("Up", function () {
    statusToState("Up 2 days").should.equal("running");
  });

  it("Paused", function () {
    statusToState("Up 2 days (Paused)").should.equal("paused");
  });

  it("Created", function () {
    statusToState("Created").should.equal("created");
  });

  it("Restarting", function () {
    statusToState("Restarting").should.equal("restarting");
  });

  it("Dead", function () {
    statusToState("Dead").should.equal("dead");
  });

  it("Exited", function () {
    statusToState("Exited (1) 13 days ago").should.equal("exited");
  });

  it("should default to Exited", function () {
    statusToState("blablabla").should.equal("exited");
  });
});
