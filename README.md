Mflow
=====

Mflow is the monad-style flow control library for nodejs.

This library is inspired by followings:

- Haskell Monads
- F# Computation Expressions
- [visionmedia/co](https://github.com/visionmedia/co)

Supported monad-style flows are followings:

- async
- lazy
- maybe
- state

# Caution

Mflow uses ECMAScript 6 generators.
Currently you must use the `--harmony-generators` flag when running node 0.11.x.

# Installation

```
$ npm install mflow
```

# Example

This is an async flow.

```js
var fs = require('fs');
var mflow = require('mflow');
var async = mflow.async;

var flow = async(function *() {
  var a = yield function(f) { fs.readFile('file1', 'utf8', f); };
  var b = yield function(f) { fs.readFile('file2', 'utf8', f); };
  return a + b;
});

flow(function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

# API

Mflow provides following top-level functions:

- async
- lazy
- maybe
- state

These functions accept a generator function which has no parameter.

## async(fn)

Makes an async flow.

- `fn`: a generator function
- return: an async function

The yieldable values are followings:

- a function which has one parameter and passes it to an async function
- an async flow

`yield` returns the async function's result.

```js
var fs = require('fs');
var mflow = require('mflow');
var async = mflow.async;

var flow = async(function *() {
  var a = yield function(f) { fs.readFile('file1', 'utf8', f); };
  var b = yield function(f) { fs.readFile('file2', 'utf8', f); };
  return a + b;
});

flow(function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

### async.join(fn...)

Runs multiple async functions in parallel.

- `fn...`: multiple functions or an array of function
- return: a yieldable function. When this function is yielded, all joined function's results are returned as an array.

```js
var fs = require('fs');
var mflow = require('mflow');
var async = mflow.async;

var flow = async(function *() {
  var a = function(f) { fs.readFile('file1', 'utf8', f); };
  var b = function(f) { fs.readFile('file2', 'utf8', f); };
  var results = yield async.join(a, b);
  // instead of multiple arguments, you can use an array.
  // var results = yield async.join([a, b]);
  return results[0] + results[1];
});

flow(function (err, data) {
  if (err) throw err;
  console.log(data);
});

```

## lazy(fn)

Makes a lazy flow.

- `fn`: a generator function
- return: a function which wraps an expression. When this function is called or is yielded, the expression is evaluated only once.

The yieldable values are followings:

- a function which has no parameter and returns a value
- a lazy flow
- non-function value: When it is yielded, the value is returned without any change.

```js
var mflow = require('mflow');
var lazy = mflow.lazy;

var x = 10;
var result = lazy(function *() {
  return x + 10;
});

console.log(result()); // 20
```

When a non-function value is yielded, the value is returned without any change.

```js
var mflow = require('mflow');
var lazy = mflow.lazy;

var x = 10;
var lazyValue1 = lazy(function *() { return x + 10; });
var lazyValue2 = lazy(function *() { return x * 10; });

function add(value1, value2) {
  return lazy(function *() {
    var a = yield value1;
    var b = yield value2;
    return a + b; 
  });
};

console.log(add(lazyValue1, lazyValue2)); // 120
console.log(add(1, 2)); // 3
```

## maybe(fn)

Runs a flow which results a successful value or `null`.

- `fn`: a generator function
- return: a successful value or `null`

The yieldable values are followings:

- `null`
- `undefined`
- other values

When `null` or `undefined` is yielded, the flow is stopped and results `null`.
Otherwise the yielded value is returned without any change.

```js
var mflow = require('mflow');
var maybe = mflow.maybe;

function add(x, y) {
  return maybe(function *() {
    var a = yield x;
    var b = yield y;
    return a + b;
  });
}

console.log(add(1, 2));    // 3
console.log(add(1, null)); // null
```

## state(fn)

Makes a state flow.

- `fn`: a generator function
- return: a function which has one parameter and returns an array. 
The parameter is a flow's state. The returned array contains the flow's result as 1st elment and the flow's state as 2nd element.

The yieldable values are followings:

- a function which has one parameter and returns an array. 
The parameter is a flow's state. The returned array contains the flow's result as 1st elment and the flow's state as 2nd element.
- a state flow

```js
var mflow = require('mflow');
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
console.log(result[0]); // 10
console.log(result[1]); // [8, 3, 0, 2, 1, 0]
```

### state.get()

Gets a flow's state.

- return: a yieldable function. When this function is apply to `yield`, a flow's state are returned. 

`pop` and `push` functions in abobe code can be replaced with following implementations using `state.get` and `state.put`:

```js
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
```

### state.put(s)

Puts a new state as a flow's state.

- `s`: a new state
- return: a yieldable function. When this function is apply to `yield`, a flow's state is replaced with the argument. 

See `state.get()`.

### state.eval(flow, s)

Runs a flow and returns the flow's result.

- `flow`: a state flow
- `s`: a flow's state

Followings are equivalent:

```js
var result = state.eval(flow, [9, 0, 2, 1, 0]);
console.log(result); // 10
```


```js
var result = flow([9, 0, 2, 1, 0]);
console.log(result[0]); // 10
```

### state.exec(flow, s)

Runs a flow and returns the flow's state.

- `flow`: a state flow
- `s`: a flow's state

Followings are equivalent:

```js
var result = state.exec(flow, [9, 0, 2, 1, 0]);
console.log(result); // [8, 3, 0, 2, 1, 0]
```


```js
var result = flow([9, 0, 2, 1, 0]);
console.log(result[1]); // [8, 3, 0, 2, 1, 0]
```

# Test

```
$ mocha --harmony-generators
```

# License

MIT
