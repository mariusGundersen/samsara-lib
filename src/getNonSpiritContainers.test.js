import { Jar } from "descartes";
import getNonSpiritContainers from "./getNonSpiritContainers.js";

describe("getNonSpiritContainers", function () {
  let result, docker;

  it("should return only containers without labels", async function () {
    const jar = new Jar();
    const listContainers = jar.probe("docker.listContainers");

    const result = getNonSpiritContainers({
      listContainers: listContainers,
    });

    listContainers.resolves([
      {
        Id: "abc1234",
        Status: "Up",
        Names: ["/Test_v23"],
        Labels: { "samsara.spirit.name": "Test" },
      },
      { Id: "abc1235", Status: "Up", Names: ["/Mail"] },
      {
        Id: "abc1236",
        Status: "Up",
        Names: ["/database_v1"],
        Labels: { "samsara.spirit.name": "database" },
      },
    ]);
    const call = await listContainers.called();
    call.args[0].should.eql({ all: true });

    const containers = await result;

    containers.length.should.equal(1);
    containers[0].id.should.equal("abc1235");
  });
});
