const cleanupOldContainers = require('./cleanupOldContainers');
const sinon = require('sinon');
const co = require('co');

describe("cleanupOldContainers", function(){
  it("should be a function", function(){
    cleanupOldContainers.should.be.a('Function');
  });
  
  describe("when called with no lives", function(){
    beforeEach(function(){
      this.logSpy = sinon.spy();
    });
    
    it("should report that there is nothing to do", co.wrap(function*(){
            
      yield cleanupOldContainers([], 0, null, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Removing 0 old containers');
      
      this.logSpy.should.have.been.calledWith('Removing 0 old images');
    }));
  });
  
  describe("when called with no lives belov the limit", function(){
    beforeEach(function(){
      this.logSpy = sinon.spy();
      this.lives = [
        {life:1}
      ];
    });
    
    it("should report that there is nothing to do", co.wrap(function*(){
            
      yield cleanupOldContainers(this.lives, 0, null, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Removing 0 old containers');
      
      this.logSpy.should.have.been.calledWith('Removing 0 old images');
    }));
  });
  
  describe("when called with one life belov the limit", function(){
    beforeEach(setup({
      image: {
        remove: Promise.resolve()
      },
      container: {
        Id: '12345abcde',
        inspect: {Image: 'abcde12345'},
        remove: Promise.resolve()
      },
      lives: [
        {
          life:1
        }
      ]
    }));
    
    it("should report which containers and images have been removed", co.wrap(function*(){
            
      yield cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Removing 1 old containers');
      
      this.logSpy.should.have.been.calledWith('Removing container 12345abcde');
      
      this.container.remove.should.have.been.calledWith({v:true});
      
      this.logSpy.should.have.been.calledWith('Removed container 12345abcde');
      
      this.docker.getImage.should.have.been.calledWith('abcde12345');
      
      this.logSpy.should.have.been.calledWith('Removing 1 old images');
      
      this.logSpy.should.have.been.calledWith('Removing image abcde12345');
      
      this.image.remove.should.have.been.calledWith();
      
      this.logSpy.should.have.been.calledWith('Removed image abcde12345');
    }));
  });
  
  describe("when removing container fails", function(){
    beforeEach(setup({
      image: {
        remove: Promise.resolve()
      },
      container: {
        Id: '12345abcde',
        inspect: {Image: 'abcde12345'},
        remove: Promise.reject(new Error())
      },
      lives: [
        {
          life:1
        }
      ]
    }));
    
    it("should not fail but report the failure", co.wrap(function*(){
            
      yield cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Removing 1 old containers');
      
      this.logSpy.should.have.been.calledWith('Removing container 12345abcde');
      
      this.container.remove.should.have.been.calledWith({v:true});
      
      this.logSpy.should.not.have.been.calledWith('Removed container 12345abcde');
      
      this.logSpy.should.have.been.calledWith('Failed to remove container 12345abcde');
      
      this.docker.getImage.should.have.been.calledWith('abcde12345');
      
      this.logSpy.should.have.been.calledWith('Removing 1 old images');
      
      this.logSpy.should.have.been.calledWith('Removing image abcde12345');
      
      this.image.remove.should.have.been.calledWith();
      
      this.logSpy.should.have.been.calledWith('Removed image abcde12345');
    }));
  });
  
  describe("when removing image fails", function(){
    beforeEach(setup({
      image: {
        remove: Promise.reject(new Error())
      },
      container: {
        Id: '12345abcde',
        inspect: {Image: 'abcde12345'},
        remove: Promise.resolve()
      },
      lives: [
        {
          life:1
        }
      ]
    }));
    
    it("should not fail but report the failure", co.wrap(function*(){
            
      yield cleanupOldContainers(this.lives, 2, this.docker, this.logSpy);
      
      this.logSpy.should.have.been.calledWith('Removing 1 old containers');
      
      this.logSpy.should.have.been.calledWith('Removing container 12345abcde');
      
      this.container.remove.should.have.been.calledWith({v:true});
      
      this.logSpy.should.have.been.calledWith('Removed container 12345abcde');
      
      this.docker.getImage.should.have.been.calledWith('abcde12345');
      
      this.logSpy.should.have.been.calledWith('Removing 1 old images');
      
      this.logSpy.should.have.been.calledWith('Removing image abcde12345');
      
      this.image.remove.should.have.been.calledWith();
      
      this.logSpy.should.not.have.been.calledWith('Removed image abcde12345');
      
      this.logSpy.should.have.been.calledWith('Failed to remove image abcde12345');
    }));
  });
});

function setup(config){
  return function(){
    this.logSpy = sinon.spy();
    var image = this.image = {
      remove: sinon.stub().returns(config.image.remove)
    };

    var container = this.container = {
      Id: config.container.Id,
      inspect: sinon.stub().returns(Promise.resolve(config.container.inspect)),
      remove: sinon.stub().returns(config.container.remove)
    };

    this.lives = config.lives.map(life => ({
      life: life.life,
      get container(){ return Promise.resolve(container); }
    }));

    this.docker = {
      getImage: sinon.stub().returns(image)
    };
  };
}