"use strict";

global.chai = require("chai");
global.should = require("chai").should();
global.expect = require("chai").expect;
global.AssertionError = require("chai").AssertionError;;

global.swallow = function (thrower) {
  try {
    thrower();
  } catch (e) { }
};

chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"))
