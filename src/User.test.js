import User from "./User.js";

describe("User", function () {
  describe("creating from string", function () {
    beforeEach(function () {
      this.user = User.create("username:secret");
    });

    it("should have the correct username", function () {
      this.user.username.should.equal("username");
    });

    it("should have the correct secret", function () {
      this.user.secret.should.equal("secret");
    });
  });

  describe("instance", function () {
    beforeEach(function () {
      this.user = new User("username", "secret");
    });

    it("should have the correct username", function () {
      this.user.username.should.equal("username");
    });

    it("should have the correct secret", function () {
      this.user.secret.should.equal("secret");
    });

    it("should toString", function () {
      this.user.toString().should.equal("username:secret");
    });
  });

  describe("when validating the right password", function () {
    beforeEach(async function () {
      this.user = new User("username");
      this.user.password = "secret";
      this.result = await this.user.validate("secret");
    });

    it("should return true", function () {
      this.result.should.be.true;
    });
  });

  describe("when validating the wrong password", function () {
    beforeEach(async function () {
      this.user = new User("username");
      this.user.password = "secret";
      this.result = await this.user.validate("wrong secret");
    });

    it("should return false", function () {
      this.result.should.be.false;
    });
  });

  describe("when setting the password", function () {
    beforeEach(async function () {
      this.user = new User("username");
      this.user.password = "secret";
    });

    it("should set the right hash method", function () {
      this.user.secret.substring(0, 6).should.equal("$apr1$");
    });
  });
});
