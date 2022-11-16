import { Jar, withArgs } from "descartes";
import fs from "fs/promises";
import path from "path";
import sinon from "sinon";
import getSpirits from "./getSpirits.js";

describe("getSpirits", function () {
  beforeEach(async function () {
    this.jar = new Jar();
    this.readdir = this.jar.probe("fs.readdir");
    this.stat = this.jar.probe("fs.stat");
    this.listContainers = this.jar.probe("docker.listContainers");

    sinon.stub(fs, "readdir").callsFake(this.readdir);

    sinon.stub(fs, "stat").callsFake(this.stat);

    this.docker = {
      listContainers: this.listContainers,
    };
  });

  afterEach(function () {
    fs.readdir.restore();
    fs.stat.restore();
  });

  it("should return the spirits", async function () {
    const result = getSpirits(this.docker);

    this.listContainers.resolves([]);
    await this.listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    this.readdir.resolves(["Test", "website", "database"]);
    await this.readdir.called(withArgs(path.normalize("config/spirits")));

    this.stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await this.stat.called(withArgs(path.normalize("config/spirits/Test")));
    await this.stat.called(withArgs(path.normalize("config/spirits/website")));
    await this.stat.called(withArgs(path.normalize("config/spirits/database")));

    this.readdir.resolves([]);
    await this.readdir.called(
      withArgs(path.normalize("config/spirits/database/lives"))
    );
    await this.readdir.called(
      withArgs(path.normalize("config/spirits/Test/lives"))
    );
    await this.readdir.called(
      withArgs(path.normalize("config/spirits/website/lives"))
    );

    this.stat.rejects(new Error());
    await this.stat.called(
      withArgs(path.normalize("config/spirits/database/deploy.lock"))
    );
    await this.stat.called(
      withArgs(path.normalize("config/spirits/Test/deploy.lock"))
    );
    await this.stat.called(
      withArgs(path.normalize("config/spirits/website/deploy.lock"))
    );

    const spirits = await result;
    spirits.map((x) => x.name).should.eql(["database", "Test", "website"]);
    this.jar.done();
  });

  it("should work when a spirit has no lives", async function () {
    const result = getSpirits(this.docker);

    this.listContainers.resolves([]);
    await this.listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    this.readdir.resolves(["Test"]);
    await this.readdir.called(withArgs(path.normalize("config/spirits")));

    this.stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await this.stat.called(withArgs(path.normalize("config/spirits/Test")));

    this.readdir.resolves([]);
    await this.readdir.called(
      withArgs(path.normalize("config/spirits/Test/lives"))
    );

    this.stat.rejects(new Error());
    await this.stat.called(
      withArgs(path.normalize("config/spirits/Test/deploy.lock"))
    );

    const spirits = await result;
    spirits.map((x) => x.name).should.eql(["Test"]);
    spirits[0].lives.should.eql([]);
    spirits[0].state.should.equal("dead");
    spirits[0].life.should.equal("?");
    this.jar.done();
  });

  it("should work when a spirit has lives", async function () {
    const result = getSpirits(this.docker);

    this.listContainers.resolves([
      createContainer("Test", 2, "Exited (1) 2 minutes ago"),
      createContainer("Test", 3, "Up 2 minutes"),
    ]);
    await this.listContainers.called().then((call) => {
      call.args[0].all.should.equal(true);
      call.args[0].filters.should.equal(
        '{"label":["samsara.spirit.life","samsara.spirit.name"]}'
      );
    });

    this.readdir.resolves(["Test"]);
    await this.readdir.called(withArgs(path.normalize("config/spirits")));

    this.stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await this.stat.called(withArgs(path.normalize("config/spirits/Test")));

    this.readdir.resolves(["1", "2"]);
    await this.readdir.called(
      withArgs(path.normalize("config/spirits/Test/lives"))
    );

    this.stat.resolves({
      isDirectory() {
        return true;
      },
    });
    await this.stat.called(
      withArgs(path.normalize("config/spirits/Test/lives/1"))
    );
    await this.stat.called(
      withArgs(path.normalize("config/spirits/Test/lives/2"))
    );

    this.stat.rejects(new Error());
    await this.stat.called(
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

    this.jar.done();
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
