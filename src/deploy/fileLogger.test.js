const sinon = require('sinon');
const co = require('co');
const descartes = require('descartes');
const fs = require('fs-promise');
const mkdirp = require('mkdirp-promise');
const fileLogger = require('./fileLogger');
const u = require('../util/unindent');

describe("fileLogger", function(){
  it("should be a function", function(){
    fileLogger.should.be.a('Function');
  });

  describe("when called", function(){
    beforeEach(function(){
      const jar = this.jar = new descartes.Jar();
      this.clock = sinon.useFakeTimers();
      this.onSpy = jar.sensor('eventEmitter.on');
      this.createWriteStreamSpy = jar.probe('createWriteStream');
      this.writeFileSpy = jar.probe('writeFile');
      this.writeSpy = jar.sensor('fileStream.write');
      this.endSpy = jar.sensor('fileStream.end');
      sinon.stub(fs, 'createWriteStream', this.createWriteStreamSpy);
      sinon.stub(fs, 'writeFile', this.writeFileSpy);
    });

    afterEach(function(){
      this.clock.restore();
      fs.createWriteStream.restore();
      fs.writeFile.restore();
    });

    it("should do things in the right order", co.wrap(function*(){
      const result = fileLogger({on: this.onSpy});

      const startCall = yield this.onSpy.called(descartes.withArgs('start'));
      const stageCall = yield this.onSpy.called(descartes.withArgs('stage'));
      const messageCall = yield this.onSpy.called(descartes.withArgs('message'));
      const stopCall = yield this.onSpy.called(descartes.withArgs('stop'));

      const onStart = startCall.args[1];
      const onStage = stageCall.args[1];
      const onMessage = messageCall.args[1];
      const onStop = stopCall.args[1];

      onStart({spirit: 'test', life: 12, containerConfig: {image: 'nginx:latest'}});

      yield this.writeFileSpy.called(descartes.withArgs('config/spirits/test/lives/12/containerConfig.yml', u`
        test:
          image: 'nginx:latest'
        `));

      this.createWriteStreamSpy.resolves({write: this.writeSpy, end: this.endSpy});
      yield this.createWriteStreamSpy.called(descartes.withArgs('config/spirits/test/lives/12/deploy.log'));

      yield this.writeSpy.called();

      this.jar.done();
    }));
  });
});