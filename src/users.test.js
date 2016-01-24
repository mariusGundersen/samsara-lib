import sinon from 'sinon';
import fs from 'fs-promise';
import {probe, withArgs, withExactArgs} from 'descartes';
import {users, addUser, saveUser} from './users';
import User from './User';
import u from './util/unindent';

describe('users', function(){
  beforeEach(function(){
    this.readFile = probe('fs.readFile');
    sinon.stub(fs, 'readFile', this.readFile);

    this.writeFile = probe('fs.writeFile');
    sinon.stub(fs, 'writeFile', this.writeFile);
  });

  afterEach(function(){
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe('getting users', function(){
    it('should return an empty array when file does not exist', async function(){
      const result = users();

      this.readFile.rejects(new Error('file does not exist'));
      await this.readFile.called(withExactArgs('config/authentication', 'utf8'));

      (await result).should.deep.equal([]);
    });

    it('should return an a user for each line in the file', async function(){
      const result = users();

      this.readFile.resolves(u`
        admin:secret
        user2:hashedPassword
      `);
      await this.readFile.called(withExactArgs('config/authentication', 'utf8'));

      const userList = await result;
      userList.length.should.equal(2);
      userList[0].should.be.an.instanceOf(User);
      userList[0].username.should.equal('admin');
      userList[0].secret.should.equal('secret');
      userList[1].should.be.an.instanceOf(User);
      userList[1].username.should.equal('user2');
      userList[1].secret.should.equal('hashedPassword');
    });
  });

  describe('adding user', function(){
    it('should add the correct user at the end of the list', async function(){
      const result = addUser('username', 'secret');

      this.readFile.rejects(new Error('file does not exist'));
      await this.readFile.called(withExactArgs('config/authentication', 'utf8'));

      this.writeFile.resolves();
      await this.writeFile.called(withArgs('config/authentication')).then(call => {
        const content = call.args[1].split('\n');
        const line1 = content[0].split(':');
        line1.length.should.equal(2);
        line1[0].should.equal('username');
      });

      await result;
    });
  });

  describe('saving user', function(){
    it("should throw if the user doesn't already exist", async function(){
      const result = saveUser(new User('username', 'secret'));

      this.readFile.rejects(new Error('file does not exist'));
      await this.readFile.called(withExactArgs('config/authentication', 'utf8'));

      await result.should.be.rejected;
    });

    it("should update the existing user", async function(){
      const result = saveUser(new User('admin', 'secret'));

      this.readFile.resolves(u`
        admin:secret
        user2:hashedPassword
      `);
      await this.readFile.called(withExactArgs('config/authentication', 'utf8'));

      this.writeFile.resolves();
      await this.writeFile.called(withArgs('config/authentication')).then(call => {
        const content = call.args[1].split('\n');
        const line1 = content[0].split(':');
        line1.length.should.equal(2);
        line1[0].should.equal('admin');
      });

      await result;
    });
  });
});
