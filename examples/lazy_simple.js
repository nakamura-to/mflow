var assert = require('assert');
var mflow = require('..');
var lazy = mflow.lazy;

var x = 10;
var result = lazy(function *() {
	return x + 10;
});

assert.strictEqual(result(), 20);
