var assert = require('assert');
var mflow = require('..');
var state = mflow.state;

var pop = function () { 
  return state(function *() {
    var s = yield state.get();
    var ret = s.shift();
    yield state.put(s);
    return ret;
  });
};

var push = function (value) {
  return state(function *() {
    var s = yield state.get();
    s.unshift(value);
    yield state.put(s);
  });
};

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
