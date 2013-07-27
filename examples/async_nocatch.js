var assert = require('assert');
var path = require('path');
var fs = require('fs');
var mflow = require('..');
var async = mflow.async;

var file1 = path.join(__dirname, 'file1.txt');
var non_existent = path.join(__dirname, 'non_existent');

// sequence
// --------

var sequenceFlow = async(function *() {
  var a = yield function(f) { fs.readFile(file1, 'utf8', f); };
  var b = yield function(f) { fs.readFile(non_existent, 'utf8', f); };
  return a + b;   
});

sequenceFlow(function (err, data) {
  assert(err);
});

// parallel
// --------

var parallelFlow = async(function *() {
  var a = function(f) { fs.readFile(file1, 'utf8', f); };
  var b = function(f) { fs.readFile(non_existent, 'utf8', f); };
  var results = yield async.join(a, b);
  return results[0] + results[1];   
});

parallelFlow(function (err, data) {
  assert(err);
});
