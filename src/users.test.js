import { probe, withArgs, withExactArgs } from "descartes";
import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "path";
import sinon from "sinon";
import u from "untab";
import "../test/common.js";
import User from "./User.js";
import { addUser, saveUser, users } from "./users.js";

describe("users", () => {
  let readFile, writeFile;
  beforeEach(() => {
    readFile = probe("fs.readFile");
    sinon.stub(fs, "readFile").callsFake(readFile);

    writeFile = probe("fs.writeFile");
    sinon.stub(fs, "writeFile").callsFake(writeFile);
  });

  afterEach(() => {
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe("getting users", () => {
    it("should return an empty array when file does not exist", async () => {
      const result = users();

      readFile.rejects(new Error("file does not exist"));
      await readFile.called(
        withExactArgs(path.normalize("config/authentication"), "utf8")
      );

      (await result).should.deep.equal([]);
    });

    it("should return an a user for each line in the file", async () => {
      const result = users();

      readFile.resolves(u`
        admin:secret
        user2:hashedPassword
      `);
      await readFile.called(
        withExactArgs(path.normalize("config/authentication"), "utf8")
      );

      const userList = await result;
      userList.length.should.equal(2);
      userList[0].should.be.an.instanceOf(User);
      userList[0].username.should.equal("admin");
      userList[0].secret.should.equal("secret");
      userList[1].should.be.an.instanceOf(User);
      userList[1].username.should.equal("user2");
      userList[1].secret.should.equal("hashedPassword");
    });
  });

  describe("adding user", () => {
    it("should add the correct user at the end of the list", async () => {
      const result = addUser("username", "secret");

      readFile.rejects(new Error("file does not exist"));
      await readFile.called(
        withExactArgs(path.normalize("config/authentication"), "utf8")
      );

      writeFile.resolves();
      await writeFile
        .called(withArgs(path.normalize("config/authentication")))
        .then((call) => {
          const content = call.args[1].split("\n");
          const line1 = content[0].split(":");
          line1.length.should.equal(2);
          line1[0].should.equal("username");
        });

      await result;
    });
  });

  describe("saving user", () => {
    it("should throw if the user doesn't already exist", async () => {
      const result = saveUser(new User("username", "secret"));

      readFile.rejects(new Error("file does not exist"));
      await readFile.called(
        withExactArgs(path.normalize("config/authentication"), "utf8")
      );

      await result.should.be.rejected;
    });

    it("should update the existing user", async () => {
      const result = saveUser(new User("admin", "secret"));

      readFile.resolves(u`
        admin:secret
        user2:hashedPassword
      `);
      await readFile.called(
        withExactArgs(path.normalize("config/authentication"), "utf8")
      );

      writeFile.resolves();
      await writeFile
        .called(withArgs(path.normalize("config/authentication")))
        .then((call) => {
          const content = call.args[1].split("\n");
          const line1 = content[0].split(":");
          line1.length.should.equal(2);
          line1[0].should.equal("admin");
        });

      await result;
    });
  });
});
