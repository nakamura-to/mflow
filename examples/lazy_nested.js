var assert = require('assert');
var mflow = require('..');
var lazy = mflow.lazy;

var x = 10;

var lazyValue1 = lazy(function *() {
	return x + 10;
});

var lazyValue2 = lazy(function *() {
	return x * 10;
});

function add(value1, value2) {
	return lazy(function *() {
		var a = yield value1;
		var b = yield value2;
		return a + b; 
	});
};

var result1 = add(lazyValue1, lazyValue2);
assert.strictEqual(result1(), 120); // (10 + 10) + (10 * 10)

var result2 = add(lazyValue1, 2);
assert.strictEqual(result2(), 22);  // (10 + 10) + 2

var result3 = add(1, lazyValue2);
assert.strictEqual(result3(), 101); // 1 + (10 * 10)

var result4 = add(1, 2);
assert.strictEqual(result4(), 3);   // 1 + 2
