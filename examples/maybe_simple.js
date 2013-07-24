var assert = require('assert');
var mflow = require('..');
var maybe = mflow.maybe;

function add(x, y) {
	return maybe(function *() {
		var a = yield x;
		var b = yield y;
		return a + b;
	});
}

var result1 = add(1, 2);
assert.strictEqual(result1, 3);

var result2 = add(1, null);
assert.strictEqual(result2, null);

var result3 = add(null, 2);
assert.strictEqual(result3, null);

var result4 = add(null, null);
assert.strictEqual(result4, null);
