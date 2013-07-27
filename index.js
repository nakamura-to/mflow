// exports
// -------

exports = module.exports = {
  async: async,
  lazy: lazy,
  maybe: maybe,
  state: state
};

// ASYNC
// -----

// Function -> Function
function async(fn) {
  assert(isGeneratorFunction(fn), 'The argument `fn` must be a GeneratorFunction.');

  run.mflow_generatorFunction = fn;
  return run;

  function run(callback) {
    assert(isFunction(callback), 'The argument `callback` must be a function.');

    var gen = fn();
    next();
 
    function next(err, rest) {
      var ret;

      if (err) {
        try {
          ret = gen.throw(err);
        } catch (e) {
          callback(e);
          return;
        }
      } else {
        if (arguments.length > 2) {
          rest = [].slice.call(arguments, 1);
        }
        try {
          ret = gen.next(rest);
        } catch (e) {
          callback(e);
          return;         
        }
      }

      if (ret.done) {
        callback(null, ret.value);
      } else {
        if (isFunction(ret.value)) {
          var f = normalize(ret.value);
          f(next);
        } else {
          next(new Error('The yieldable value must be a function.'));
        }
      }
    }
  }

  function normalize(obj) {
    if (obj && obj.mflow_generatorFunction) obj = obj.mflow_generatorFunction;
    if (isGeneratorFunction(obj)) obj = async(obj);
    return obj;
  }
}

// [Function fns...] -> Function
async.join = function (fns) {
  if (!Array.isArray(fns)) fns = [].slice.call(arguments);
  for (var i = 0, len = fns.length; i < len; i++) {
    assert(isFunction(fns[i]), 'The argument[' + i + '] must be a function.');
  }
  return run;

  function run(callback) {
    var pending = fns.length;
    var results = Array(pending);
    var finished;

    for (var i = 0, len = fns.length; i < len; i++) {
      fns[i](wrap(i));
    }

    function wrap(i) {
      return function (err, rest) {
        if (finished) return;
        if (err) {
          finished = true;
          callback(err);
        } else {
          if (arguments.length > 2) rest = [].slice.call(arguments, 1);
          results[i] = rest;
          pending--;
          if (pending === 0) callback(null, results);
        }
      };
    }
  };
};


// LAZY
// ----

// Function -> Function
function lazy(fn) {
  assert(isGeneratorFunction(fn), 'The argument `fn` must be a GeneratorFunction.');

  run.mflow_generatorFunction = fn;
  return run;

  var finished;
  var result;
 
  function run() {
    if (finished) return result;
    var gen = fn();
    var ret = gen.next();
    var value;
    while (!ret.done) {
      value = normalize(ret.value);
      ret = gen.next(value);
    }
    finished = true;
    result = ret.value;
    return result;
  }

  function normalize(obj) {
    if (obj && obj.mflow_generatorFunction) obj = obj.mflow_generatorFunction;
    if (isGeneratorFunction(obj)) obj = lazy(obj);
    if (isFunction(obj)) obj = obj();
    return obj;
  }
}

// MAYBE
// -----

// Function -> Object
function maybe(fn) {
  assert(isGeneratorFunction(fn), 'The argument `fn` must be a GeneratorFunction.');

  var gen = fn();
  var ret = gen.next();
  while (!ret.done) {
    if (ret.value == null) return null;
    ret = gen.next(ret.value);
  }
  return ret.value;
}


// STATE
// -----

// Function -> Function
function state(fn) {
  assert(isGeneratorFunction(fn), 'The argument `fn` must be a GeneratorFunction.');

  run.mflow_generatorFunction = fn;
  return run;
 
  function run(state) {
    var gen = fn();
    var ret = gen.next();
    var pair;
    var value;
    while (!ret.done) {
      if (isFunction(ret.value)) {
        f = normalize(ret.value);
        pair = f(state);
        if (Array.isArray(pair)) {
          value = pair[0];
          state = pair[1];          
        } else {
          value = pair;
        }
        ret = gen.next(value);
      } else {
        ret = gen.throw(new Error("The yieldable value must be a function."));
      }
    }
    return [ret.value, state];  
  };

  function normalize(obj) {
    if (obj && obj.mflow_generatorFunction) obj = obj.mflow_generatorFunction;
    if (isGeneratorFunction(obj)) obj = state(obj);
    return obj;
  }
}
 
// Object -> Function
state.put = function (s) {
  return function () {
    return [null, s];
  }
}

// Void -> Function
state.get = function () {
  return function (s) {
    return [s, s];
  }
}

// Function, Object -> Object
state.eval = function (flow, s) {
  assert(isFunction(flow), 'The argument `flow` must be a function.');
  var pair = flow(s);
  assert(Array.isArray(pair), 'The argument `flow` must return an array.');
  return pair[0];
}
 
// Function, Object -> Object
state.exec = function (flow, s) {
  assert(isFunction(flow), 'The argument `flow` must be a function.');
  var pair = flow(s);
  assert(Array.isArray(pair), 'The argument `flow` must return an array.');
  return pair[1];
}


// utilities
// ---------

function assert(prerequisite, message) {
  if (prerequisite) return;
  throw new Error(message);
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' === obj.constructor.name;
}
