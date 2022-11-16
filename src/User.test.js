import { beforeEach, describe, it } from "node:test";
import "../test/common.js";
import User from "./User.js";

describe("User", () => {
  let user;
  describe("creating from string", () => {
    beforeEach(() => {
      user = User.create("username:secret");
    });

    it("should have the correct username", () => {
      user.username.should.equal("username");
    });

    it("should have the correct secret", () => {
      user.secret.should.equal("secret");
    });
  });

  describe("instance", () => {
    beforeEach(() => {
      user = new User("username", "secret");
    });

    it("should have the correct username", () => {
      user.username.should.equal("username");
    });

    it("should have the correct secret", () => {
      user.secret.should.equal("secret");
    });

    it("should toString", () => {
      user.toString().should.equal("username:secret");
    });
  });

  describe("when validating the right password", () => {
    beforeEach(() => {
      user = new User("username");
      user.password = "secret";
    });

    it("should return true", async () => {
      let result = await user.validate("secret");
      result.should.be.true;
    });
  });

  describe("when validating the wrong password", () => {
    beforeEach(() => {
      user = new User("username");
      user.password = "secret";
    });

    it("should return false", async () => {
      let result = await user.validate("wrong secret");
      result.should.be.false;
    });
  });

  describe("when setting the password", () => {
    beforeEach(async () => {
      user = new User("username");
      user.password = "secret";
    });

    it("should set the right hash method", () => {
      user.secret.substring(0, 6).should.equal("$apr1$");
    });
  });
});
