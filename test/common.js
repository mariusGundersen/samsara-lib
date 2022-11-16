"use strict";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

global.chai = chai;
global.should = chai.should();
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;

global.swallow = function (thrower) {
  try {
    thrower();
  } catch (e) {}
};

chai.use(sinonChai);
chai.use(chaiAsPromised);
