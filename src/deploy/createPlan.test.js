import {deploy, revive} from './createPlan';

describe("createPlan", function(){
  it("should have a method for creating a deploy plan", function(){
    deploy.should.exist;
  });

  it("should have a method for creating a reincarnation plan", function(){
    revive.should.exist;
  });

  describe("deploy", function(){
    describe("without cleanupLimit", function(){
      it("should have 4 items", function(){
        deploy({}).length.should.equal(4);
      });

      it("should have the right order", function(){
        deploy({}).should.eql(["pull", "create", "start", "stop"]);
      });
    });

    describe("with cleanupLimit greater than 0", function(){
      it("should have 5 items", function(){
        deploy({cleanupLimit:5}).length.should.equal(5);
      });

      it("should have the right order", function(){
        deploy({cleanupLimit:5}).should.eql(["pull", "create", "start", "stop", "cleanup"]);
      });
    });

    describe("with stop before start", function(){
      it("should have 4 items", function(){
        deploy({deploymentMethod:'stop-before-start'}).length.should.equal(4);
      });

      it("should have the right order", function(){
        deploy({deploymentMethod:'stop-before-start'}).should.eql(["pull", "create", "stop", "start"]);
      });
    });
  });

  describe("revive", function(){
    describe("with start before stop", function(){
      it("should have 2 items", function(){
        revive({deploymentMethod:'start-before-stop'}).length.should.equal(2);
      });

      it("should have the right order", function(){
        revive({deploymentMethod:'start-before-stop'}).should.eql(["start", "stop"]);
      });
    });

    describe("with stop before start", function(){
      it("should have 2 items", function(){
        revive({deploymentMethod:'stop-before-start'}).length.should.equal(2);
      });

      it("should have the right order", function(){
        revive({deploymentMethod:'stop-before-start'}).should.eql(["stop", "start"]);
      });
    });
  });
});
