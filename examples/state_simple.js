var assert = require('assert');
var mflow = require('..');
var state = mflow.state;

function pop() {
  return function (s) {
    return [s.shift(), s];
  };
}
 
function push(value) {
  return function (s) {
    s.unshift(value);
    return [null, s];
  };
}

var flow = state(function* () {
	var a = yield pop();
	if (a === 5) {
		yield push(5);
	} else {
		yield push(3);
		yield push(8);
	}
  return 10;
});

var result = flow([9, 0, 2, 1, 0]);
assert.deepEqual(result, [10, [8, 3, 0, 2, 1, 0]]);