import deploy from "./deploy.js";

describe("deploy", function () {
  it("should deploy", function () {
    deploy(
      {
        settings: Promise.resolve({}),
      },
      {}
    );
  });
});
