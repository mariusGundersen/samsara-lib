import { Jar, withArgs } from "descartes";
import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import "../test/common.js";
import getSpirits from "./getSpirits.js";

describe("getSpirits", () => {
  let jar, readdir, stat, listContainers, docker;
  beforeEach(async () => {
    jar = new Jar();
    readdir = jar.probe("fs.readdir");
    stat = jar.probe("fs.stat");
    listContainers = jar.probe("docker.listContainers");

    sinon.stub(fs, "readdir").callsFake(readdir);

    sinon.stub(fs, "stat").callsFake(stat);

    docker = {
      listContainers: listContainers,
    };
  });

  afterEach(() => {
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should return the spirits", async () => {
    const result = getSpirits(docker);

    listContainers.resolves([]);
    await listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    readdir.resolves(["Test", "website", "database"]);
    await readdir.called(withArgs(path.normalize("config/spirits")));

    stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await stat.called(withArgs(path.normalize("config/spirits/Test")));
    await stat.called(withArgs(path.normalize("config/spirits/website")));
    await stat.called(withArgs(path.normalize("config/spirits/database")));

    readdir.resolves([]);
    await readdir.called(
      withArgs(path.normalize("config/spirits/database/lives"))
    );
    await readdir.called(withArgs(path.normalize("config/spirits/Test/lives")));
    await readdir.called(
      withArgs(path.normalize("config/spirits/website/lives"))
    );

    stat.rejects(new Error());
    await stat.called(
      withArgs(path.normalize("config/spirits/database/deploy.lock"))
    );
    await stat.called(
      withArgs(path.normalize("config/spirits/Test/deploy.lock"))
    );
    await stat.called(
      withArgs(path.normalize("config/spirits/website/deploy.lock"))
    );

    const spirits = await result;
    spirits.map((x) => x.name).should.eql(["database", "Test", "website"]);
    jar.done();
  });

  it("should work when a spirit has no lives", async () => {
    const result = getSpirits(docker);

    listContainers.resolves([]);
    await listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    readdir.resolves(["Test"]);
    await readdir.called(withArgs(path.normalize("config/spirits")));

    stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await stat.called(withArgs(path.normalize("config/spirits/Test")));

    readdir.resolves([]);
    await readdir.called(withArgs(path.normalize("config/spirits/Test/lives")));

    stat.rejects(new Error());
    await stat.called(
      withArgs(path.normalize("config/spirits/Test/deploy.lock"))
    );

    const spirits = await result;
    spirits.map((x) => x.name).should.eql(["Test"]);
    spirits[0].lives.should.eql([]);
    spirits[0].state.should.equal("dead");
    spirits[0].life.should.equal("?");
    jar.done();
  });

  it("should work when a spirit has lives", async () => {
    const result = getSpirits(docker);

    listContainers.resolves([
      createContainer("Test", 2, "Exited (1) 2 minutes ago"),
      createContainer("Test", 3, "Up 2 minutes"),
    ]);
    await listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    readdir.resolves(["Test"]);
    await readdir.called(withArgs(path.normalize("config/spirits")));

    stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await stat.called(withArgs(path.normalize("config/spirits/Test")));

    readdir.resolves(["1", "2"]);
    await readdir.called(withArgs(path.normalize("config/spirits/Test/lives")));

    stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await stat.called(withArgs(path.normalize("config/spirits/Test/lives/1")));
    await stat.called(withArgs(path.normalize("config/spirits/Test/lives/2")));

    stat.rejects(new Error());
    await stat.called(
      withArgs(path.normalize("config/spirits/Test/deploy.lock"))
    );

    const spirits = await result;
    spirits.map((x) => x.name).should.eql(["Test"]);
    spirits[0].state.should.equal("running");
    spirits[0].life.should.equal(3);
    const lives = spirits[0].lives;
    lives.length.should.equal(3);
    lives[0].life.should.equal(1);
    lives[0].state.should.equal("dead");
    lives[0].uptime.should.equal("");
    lives[1].life.should.equal(2);
    lives[1].state.should.equal("exited");
    lives[1].uptime.should.equal("2 minutes ago");
    lives[2].life.should.equal(3);
    lives[2].state.should.equal("running");
    lives[2].uptime.should.equal("2 minutes");

    jar.done();
  });
});

function createContainer(name, life, status) {
  return {
    Labels: {
      "samsara.spirit.name": name,
      "samsara.spirit.life": life,
    },
    Status: status,
  };
}
