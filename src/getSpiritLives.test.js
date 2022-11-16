import fs from "fs/promises";
import getSpiritLives from "./getSpiritLives.js";

import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import "../test/common.js";

describe("getSpiritLives", () => {
  let result, docker;

  beforeEach(async () => {
    sinon.stub(fs, "readdir").returns(Promise.resolve(["3", "1", "2"]));

    sinon.stub(fs, "stat").returns(
      Promise.resolve({
        isDirectory() {
          return true;
        },
      })
    );

    docker = {
      listContainers: sinon
        .stub()
        .returns(
          Promise.resolve([
            { Labels: { "samsara.spirit.life": "2" } },
            { Labels: { "samsara.spirit.life": "3" } },
            { Labels: { "samsara.spirit.life": "4" } },
          ])
        ),
    };

    because: {
      result = await getSpiritLives("test", docker);
    }
  });

  afterEach(() => {
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should read dir from the right directory", () => {
    fs.readdir.should.have.been.calledWith(
      path.join("config", "spirits", "test", "lives")
    );
  });

  it("should get all containers with the right name", () => {
    docker.listContainers.should.have.been.calledWith({
      all: true,
      filters: '{"label":["samsara.spirit.life","samsara.spirit.name=test"]}',
    });
  });

  it("should return names which are both containers and directories", () => {
    result.should.contain("2");
    result.should.contain("3");
  });

  it("should return names which are only containers", () => {
    result.should.contain("4");
  });

  it("should return names which are only directories", () => {
    result.should.contain("1");
  });

  it("should not return duplicates", () => {
    result.length.should.equal(4);
  });

  it("should return the spirits in sorted order", () => {
    result.should.eql(["1", "2", "3", "4"]);
  });
});
