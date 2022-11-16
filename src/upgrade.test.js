import { Jar, withArgs, withExactArgs } from "descartes";
import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import u from "untab";
import "../test/common.js";
import upgrade from "./upgrade.js";

describe("upgrade", () => {
  let jar, readdir, stat, readFile, writeFile;
  beforeEach(() => {
    jar = new Jar();
    readdir = jar.probe("fs.readdir");
    stat = jar.probe("fs.stat");
    readFile = jar.probe("fs.readFile");
    writeFile = jar.probe("fs.writeFile");
    sinon.stub(fs, "readdir").callsFake(readdir);
    sinon.stub(fs, "stat").callsFake(stat);
    sinon.stub(fs, "readFile").callsFake(readFile);
    sinon.stub(fs, "writeFile").callsFake(writeFile);
  });

  afterEach(() => {
    fs.readdir.restore();
    fs.stat.restore();
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  it("should work", async () => {
    const result = upgrade();

    stat.resolves(isFile(false));
    await stat.called(withExactArgs(path.normalize("config/authentication")));

    readFile.rejects(new Error("file does not exist"));
    await readFile.called(
      withExactArgs(path.normalize("config/authentication"), "utf8")
    );

    await writeFile
      .called(withArgs(path.normalize("config/authentication")))
      .then((call) => {
        const entry = call.args[1].split("\n")[0].split(":");
        entry[0].should.equal("admin");
      });

    readdir.resolves(["test", "file.json"]);
    await readdir.called(withExactArgs(path.normalize("config/spirits")));

    stat.resolves(isDirectory(true));
    await stat.called(withExactArgs(path.normalize("config/spirits/test")));
    stat.resolves(isDirectory(false));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/file.json"))
    );

    stat.resolves(isFile(false));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/test/settings.json"))
    );
    stat.resolves(isFile(false));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/test/containerConfig.yml"))
    );
    stat.resolves(isFile(true));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/test/config.json"))
    );

    readFile.resolves(
      JSON.stringify(
        {
          deploymentMethod: "start-before-stop",
          cleanupLimit: 0,
          description: "test",
          url: "https://test.mariusgundersen.net",
          webhook: {
            enable: false,
          },
          image: "nginx",
          tag: "latest",
          env: {},
          volumes: {},
          ports: {},
          links: {},
          volumesFrom: [],
        },
        null,
        "  "
      )
    );
    await readFile.called(
      withArgs(path.normalize("config/spirits/test/config.json"))
    );

    await writeFile
      .called(withArgs(path.normalize("config/spirits/test/settings.json")))
      .then((call) => {
        call.args[1].should.equal(
          JSON.stringify(
            {
              name: "test",
              deploymentMethod: "start-before-stop",
              cleanupLimit: 0,
              description: "test",
              url: "https://test.mariusgundersen.net",
              webhook: {
                enable: false,
              },
            },
            null,
            "  "
          )
        );
      });

    await writeFile
      .called(
        withArgs(path.normalize("config/spirits/test/containerConfig.yml"))
      )
      .then((call) => {
        call.args[1].should.equal(u`
        test:
          image: 'nginx:latest'
        `);
      });

    readdir.resolves(["1"]);
    await readdir.called(withArgs(path.normalize("config/spirits/test/lives")));
    stat.resolves(isDirectory(true));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/test/lives/1"))
    );

    stat.resolves(isFile(false));
    await stat.called(
      withExactArgs(
        path.normalize("config/spirits/test/lives/1/containerConfig.yml")
      )
    );
    stat.resolves(isFile(true));
    await stat.called(
      withExactArgs(path.normalize("config/spirits/test/lives/1/config.json"))
    );

    readFile.resolves(
      JSON.stringify(
        {
          deploymentMethod: "start-before-stop",
          cleanupLimit: 0,
          description: "test",
          url: "https://test.mariusgundersen.net",
          webhook: {
            enable: false,
          },
          image: "nginx",
          tag: "latest",
          env: {},
          volumes: {},
          ports: {},
          links: {},
          volumesFrom: [],
        },
        null,
        "  "
      )
    );
    await readFile.called(
      withArgs(path.normalize("config/spirits/test/lives/1/config.json"))
    );

    await writeFile
      .called(
        withArgs(
          path.normalize("config/spirits/test/lives/1/containerConfig.yml")
        )
      )
      .then((call) => {
        call.args[1].should.equal(u`
        test:
          container_name: test_v1
          image: 'nginx:latest'
        `);
      });

    await result;
    jar.done();
  });
});

function isDirectory(isDir) {
  return {
    isDirectory() {
      return isDir;
    },
  };
}

function isFile(isFile) {
  return {
    isFile() {
      return isFile;
    },
  };
}
