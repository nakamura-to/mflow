var assert = require('assert');
var mflow = require('..');
var state = mflow.state;

describe('state', function() {
  
  function pop() {
    return function (state) {
      state = state.slice();
      return [state.shift(), state];
    };
  }
   
  function push(value) {
    return function (state) {
      state = state.slice();
      state.unshift(value);
      return [null, state];
    };
  }

  function ten() {
    return function (state) {
      return 10;
    };
  }  

  it('should result a return value and state', function () {
    var stackFlow = state(function* () {
      yield push(1);
      yield push(2);
      var a = yield pop();
      yield push(a * a);
      yield push(3);
      return 10;
    });

    var initState = [0];

    var result = stackFlow(initState);
    assert.deepEqual([10, [3, 4, 1, 0]], result);

    result = state.exec(stackFlow, initState);
    assert.deepEqual([3, 4, 1, 0], result);

    result = state.eval(stackFlow, initState);
    assert.deepEqual(10, result);
  });

  it('should chain an other state flow', function () {
    var subFlow = state(function* () {
      var a = yield pop();
      yield push(a * a);
      yield push(4);
      return 20;
    });

    var stackFlow = state(function* () {
      yield push(1);
      yield push(2);
      var a = yield pop();
      yield push(a * a);
      yield push(3);
      var ret = yield subFlow;
      return 10 + ret;
    });

    var initState = [0];

    var result = stackFlow(initState);
    assert.deepEqual([30, [4, 9, 4, 1, 0]], result);

    result = state.exec(stackFlow, initState);
    assert.deepEqual([4, 9, 4, 1, 0], result);

    result = state.eval(stackFlow, initState);
    assert.deepEqual(30, result);
  });

  it('should chain a generator function', function () {
    var subFlow = function* () {
      var a = yield pop();
      yield push(a * a);
      yield push(4);
      return 20;
    };

    var stackFlow = state(function* () {
      yield push(1);
      yield push(2);
      var a = yield pop();
      yield push(a * a);
      yield push(3);
      var ret = yield* subFlow();
      return 10 + ret;
    });

    var initState = [0];

    var result = stackFlow(initState);
    assert.deepEqual([30, [4, 9, 4, 1, 0]], result);

    result = state.exec(stackFlow, initState);
    assert.deepEqual([4, 9, 4, 1, 0], result);

    result = state.eval(stackFlow, initState);
    assert.deepEqual(30, result);
  });

  it('should set new state', function () {

    var stackFlow = state(function* () {
      yield push(1);
      yield push(2);
      return yield state.put([10, 20, 30]);
    });

    var initState = [0];

    var result = stackFlow(initState);
    assert.deepEqual([null, [10, 20, 30]], result);

    result = state.exec(stackFlow, initState);
    assert.deepEqual([10, 20, 30], result);

    result = state.eval(stackFlow, initState);
    assert.deepEqual(null, result);
  });

   it('should get current state', function () {

    var stackFlow = state(function* () {
      yield push(1);
      yield push(2);
      return yield state.get();
    });

    var initState = [0];

    var result = stackFlow(initState);
    assert.deepEqual([[2, 1, 0], [2, 1, 0]], result);

    result = state.exec(stackFlow, initState);
    assert.deepEqual([2, 1, 0], result);

    result = state.eval(stackFlow, initState);
    assert.deepEqual([2, 1, 0], result);
  });
 
  it('should support a functin which returns a non-array value', function () {
    var flow = state(function* () {
      return (yield ten()) + 1;
    });

    var result = flow(1);
    assert.deepEqual(result, [11, 1]);
  });
});
