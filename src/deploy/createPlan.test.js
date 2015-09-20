const createPlan = require('./createPlan');

describe("createPlan", function(){
  it("should have a method for creating a deploy plan", function(){
    createPlan.deploy.should.exist;
  });
  
  it("should have a method for creating a reincarnation plan", function(){
    createPlan.reincarnate.should.exist;
  });
  
  describe("deploy", function(){
    describe("without cleanupLimit", function(){
      it("should have 5 items", function(){
        createPlan.deploy({}).length.should.equal(5);
      });
      
      it("should have the right order", function(){
        createPlan.deploy({}).should.eql(["pull", "create", "start", "stop", "done"]);
      });
    });
    
    describe("with cleanupLimit greater than 0", function(){
      it("should have 6 items", function(){
        createPlan.deploy({cleanupLimit:5}).length.should.equal(6);
      });
      
      it("should have the right order", function(){
        createPlan.deploy({cleanupLimit:5}).should.eql(["pull", "create", "start", "stop", "cleanup", "done"]);
      });
    });
    
    describe("with stop before start", function(){
      it("should have 5 items", function(){
        createPlan.deploy({deploymentMethod:'stop-before-start'}).length.should.equal(5);
      });
      
      it("should have the right order", function(){
        createPlan.deploy({deploymentMethod:'stop-before-start'}).should.eql(["pull", "create", "stop", "start", "done"]);
      });
    });
  });
  
  describe("reincarnate", function(){
    describe("with start before stop", function(){
      it("should have 3 items", function(){
        createPlan.reincarnate({deploymentMethod:'start-before-stop'}).length.should.equal(3);
      });
      
      it("should have the right order", function(){
        createPlan.reincarnate({deploymentMethod:'start-before-stop'}).should.eql(["start", "stop", "done"]);
      });
    });
    
    describe("with stop before start", function(){
      it("should have 3 items", function(){
        createPlan.reincarnate({deploymentMethod:'stop-before-start'}).length.should.equal(3);
      });
      
      it("should have the right order", function(){
        createPlan.reincarnate({deploymentMethod:'stop-before-start'}).should.eql(["stop", "start", "done"]);
      });
    });
  });
});