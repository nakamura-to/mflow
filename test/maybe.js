var assert = require('assert');
var mflow = require('..');
var maybe = mflow.maybe;

describe('maybe', function() {
  it('should success when all yieldable values are not null or not undefined', function () {
    var result = maybe(function* () {
      var a = yield 1;
      var b = yield 2;
      return a + b;
    });
    assert.strictEqual(result, 3);
  });

  it('should return null when the 1st yieldable value is null', function () {
    var result = maybe(function* () {
      var a = yield null;
      var b = yield 2;
      return a + b;
    });
    assert.strictEqual(result, null);
  });

  it('should return null when the 2nd yieldable value is null', function () {
    var result = maybe(function* () {
      var a = yield 1;
      var b = yield null;
      return a + b;
    });
    assert.strictEqual(result, null);
  });

  it('should return null when the 1st yieldable value is undefined', function () {
    var result = maybe(function* () {
      var a = yield undefined;
      var b = yield 2;
      return a + b;
    });
    assert.strictEqual(result, null);
  });

  it('should return null when the 2nd yieldable value is undefined', function () {
    var result = maybe(function* () {
      var a = yield 1;
      var b = yield undefined;
      return a + b;
    });
    assert.strictEqual(result, null);
  });
});