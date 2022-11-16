import { describe, it } from "node:test";
import "../../test/common.js";
import { filter } from "./asyncArray.js";

describe("asyncArray", () => {
  it("should accept a promise predicate", () => {
    return filter([1, 2, 3], (x) => new Promise((r) => r(x < 3))).then((l) =>
      l.should.eql([1, 2])
    );
  });

  it("should accept a promise list", () => {
    return Promise.resolve([1, 2, 3])
      .then(filter((x) => new Promise((r) => r(x < 3))))
      .then((l) => l.should.eql([1, 2]));
  });
});
