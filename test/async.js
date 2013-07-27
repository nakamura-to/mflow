var assert = require('assert');
var fs = require('fs');
var path = require('path');
var mflow = require('..');
var async = mflow.async;

describe('async', function() {
  var file1 = path.join(__dirname, 'file1.txt');
  var file2 = path.join(__dirname, 'file2.txt');
  var non_existent = path.join(__dirname, 'non_existent');
  
  it('should chain function calls', function (done) {
    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      var b = yield function(next) { fs.readFile(file2, 'utf8', next); };
      return a + b;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.strictEqual(data, 'FILE1\r\nFILE2\r\n');
      done();
    });
  });

  it('should catch a yield error', function (done) {
    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      try {
        var b = yield function(next) { fs.readFile(non_existent, 'utf8', next); };
      } catch(e) {
        b = "non_existent"
      }
      return a + b;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.strictEqual(data, 'FILE1\r\nnon_existent');
      done();
    });
  });

  it('should throw a yield error', function (done) {
    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      var b = yield function(next) { fs.readFile(non_existent, 'utf8', next); };
      return a + b;
    });
     
    asyncFlow(function (err, data) {
      assert(err);
      done();
    });
  });

  it('should rethrow a yield error', function (done) {
    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      try {
        var b = yield function(next) { fs.readFile(non_existent, 'utf8', next); };
      } catch(e) {
        throw e;
      }
      return a + b;
    });
     
    asyncFlow(function (err, data) {
      assert(err);
      done();
    });
  });

  it('should chain an other async flow', function (done) {
    var subFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      return a
    });

    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      var b = yield function(next) { fs.readFile(file2, 'utf8', next); };
      var c = yield subFlow;
      return a + b + c;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.strictEqual(data, 'FILE1\r\nFILE2\r\nFILE1\r\n');
      done();
    });
  });

  it('should chain a generator function', function (done) {
    var subFlow = function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      return a
    }

    var asyncFlow = async(function *() {
      var a = yield function(next) { fs.readFile(file1, 'utf8', next); };
      var b = yield function(next) { fs.readFile(file2, 'utf8', next); };
      var c = yield subFlow;
      return a + b + c;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.strictEqual(data, 'FILE1\r\nFILE2\r\nFILE1\r\n');
      done();
    });
  });

  it('should call with async.join', function (done) {
    var asyncFlow = async(function *() {
      var a = function(next) { fs.readFile(file1, 'utf8', next); };
      var b = function(next) { fs.readFile(file2, 'utf8', next); };
      var c = yield async.join(a, b);
      return c;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.deepEqual(data, ['FILE1\r\n', 'FILE2\r\n']);
      done();
    });
  });

  it('should accept only function', function (done) {
    var asyncFlow = async(function *() {
      var a = yield 'hoge';
      return a;
    });
     
    asyncFlow(function (err, data) {
      assert(err);
      done();
    });
  });
  
  it('should throw a yield error in async.join', function (done) {
    var asyncFlow = async(function *() {
      var a = function(next) { fs.readFile(file1, 'utf8', next); };
      var b = function(next) { fs.readFile(non_existent, 'utf8', next); };
      var c = yield async.join(a, b);
      return c;
    });
     
    asyncFlow(function (err, data) {
      assert(err);
      done();
    });
  });

  it('should catch a yield error in async.join', function (done) {
    var asyncFlow = async(function *() {
      var a = function(next) { fs.readFile(file1, 'utf8', next); };
      var b = function(next) { fs.readFile(non_existent, 'utf8', next); };
      try {
        var c = yield async.join(a, b);
      } catch (e) {
        c = 'hoge';
      }
      return c;
    });
     
    asyncFlow(function (err, data) {
      if (err) throw(err);
      assert.strictEqual(data, 'hoge');
      done();
    });
  });

  it('should rethrow a yield error in async.join', function (done) {
    var asyncFlow = async(function *() {
      var a = function(next) { fs.readFile(file1, 'utf8', next); };
      var b = function(next) { fs.readFile(non_existent, 'utf8', next); };
      try {
        var c = yield async.join(a, b);
      } catch (e) {
        throw e;
      }
      return c;
    });
     
    asyncFlow(function (err, data) {
      assert(err);
      done();
    });
  });
});
