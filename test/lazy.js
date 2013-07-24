var assert = require('assert');
var mflow = require('..');
var lazy = mflow.lazy;

describe('lazy', function() {
  it('should run only once', function () {
    var count = 0;
    var lazyFlow = lazy(function* () {
      count++;
      return 1 + 2;
    });

    assert.strictEqual(lazyFlow(), 3);
    assert.strictEqual(lazyFlow(), 3);
    assert.strictEqual(count, 1);
  });

  it('should accept a primitive value', function () {
    var lazyFlow = lazy(function* () {
      var a = yield 1;
      var b = yield 2;
      return a + b;
    });

    assert.strictEqual(lazyFlow(), 3);
  });

  it('should accept a function', function () {
    var lazyFlow = lazy(function* () {
      var a = yield function () { return 1; };
      var b = yield function () { return 2; };
      return a + b;
    });

    assert.strictEqual(lazyFlow(), 3);
  });

  it('should chain an other lazy flow', function () {
    var subFlow = lazy(function* () {
      return 1;
    });

    var lazyFlow = lazy(function* () {
      var a = yield subFlow;
      return a + 2;
    });

    assert.strictEqual(lazyFlow(), 3);
  });
});