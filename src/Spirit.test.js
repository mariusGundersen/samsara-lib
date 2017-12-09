import Spirit from './Spirit';
import fs from 'fs-promise';
import sinon from 'sinon';
import u from 'untab';

describe("the Spirit", function() {

  it("should export a constructor function", function() {
    Spirit.should.be.an.instanceOf(Function);
  });

  describe("instance", function() {
    let instance,
        docker = {
          listContainers: sinon.stub()
        };

    beforeEach(function() {
      instance = new Spirit("test", docker);
    });

    afterEach(function(){
      docker.listContainers.reset();
    });

    it("should be a Spirit", function() {
      instance.should.be.an.instanceOf(Spirit);
    });

    describe("isDeploying", function(){
      beforeEach(function(){
        sinon.stub(fs, 'exists')
          .returns(true);

        because: {
          instance.isDeploying;
        }
      });

      afterEach(function(){
        fs.exists.restore();
      });

      it("should check if the right file exists", function(){
        fs.exists.should.have.been.calledWith('config/spirits/test/deploy.lock');
      });
    });

    describe("containerConfig", function(){
      let result;

      beforeEach(async function(){
        sinon.stub(fs, 'readFile')
          .returns(Promise.resolve(u`
            test:
              image: nginx:latest
            `));

        because: {
          result = await instance.containerConfig;
        }
      });

      afterEach(function(){
        fs.readFile.restore();
      });

      it("should read the correct file", function(){
        fs.readFile.should.have.been.calledWith('config/spirits/test/containerConfig.yml');
      });
    });

    describe("settings", function(){
      let result;

      beforeEach(async function(){
        sinon.stub(fs, 'readFile')
          .returns(Promise.resolve(JSON.stringify({name:'test'})));

        because: {
          result = await instance.settings;
        }
      });

      afterEach(function(){
        fs.readFile.restore();
      });

      it("should read the correct file", function(){
        fs.readFile.should.have.been.calledWith('config/spirits/test/settings.json');
      });

      it("should return json", function(){
        result.should.deep.equal({name:'test'});
      });

      describe("mutate", function(){
        beforeEach(async function(){
          sinon.stub(fs, 'writeFile')
            .returns(Promise.resolve());

          because: {
            result = await instance.mutateSettings(settings => settings.name = 'hello');
          }
        });

        it("should read the correct file", function(){
          fs.readFile.should.have.been.calledWith('config/spirits/test/settings.json');
        });

        it("should write the correct file and content", function(){
          fs.writeFile.should.have.been.calledWith('config/spirits/test/settings.json', JSON.stringify({name: 'hello'}, null, '  '));
        });

        afterEach(function(){
          fs.writeFile.restore();
        });
      });
    });

    describe("status stopped", function(){
      let result;

      beforeEach(async function(){
        docker.listContainers
          .returns(Promise.resolve([]));

        because: {
          result = await instance.status;
        }
      });

      it("should filter correctly", function(){
        docker.listContainers.should.have.been.calledWith({
          filters: '{"label":["samsara.spirit.life","samsara.spirit.name=test"],"status":["running"]}'
        });
      });

      it("should be stopped", function(){
        result.should.deep.equal('stopped');
      });
    });

    describe("status running", function(){
      let result;

      beforeEach(async function(){
        docker.listContainers
          .returns(Promise.resolve([{}]));

        because: {
          result = await instance.status;
        }
      });

      it("should filter correctly", function(){
        docker.listContainers.should.have.been.calledWith({
          filters: '{"label":["samsara.spirit.life","samsara.spirit.name=test"],"status":["running"]}'
        });
      });

      it("should be stopped", function(){
        result.should.deep.equal('running');
      });
    });
  });
});
