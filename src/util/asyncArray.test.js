import { filter } from "./asyncArray.js";

describe("asyncArray", function () {
  it("should accept a promise predicate", function () {
    return filter([1, 2, 3], (x) => new Promise((r) => r(x < 3))).then((l) =>
      l.should.eql([1, 2])
    );
  });

  it("should accept a promise list", function () {
    return Promise.resolve([1, 2, 3])
      .then(filter((x) => new Promise((r) => r(x < 3))))
      .then((l) => l.should.eql([1, 2]));
  });
});
