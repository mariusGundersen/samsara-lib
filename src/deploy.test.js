import { describe, it } from "node:test";
import "../test/common.js";
import deploy from "./deploy.js";

describe("deploy", () => {
  it("should deploy", () => {
    deploy(
      {
        settings: Promise.resolve({}),
      },
      {}
    );
  });
});
