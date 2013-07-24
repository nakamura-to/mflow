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
	try {
		var b = yield function(f) { fs.readFile(non_existent, 'utf8', f); };
		return a + b;		
	} catch (e) {
		return 'failed';
	}
});

sequenceFlow(function (err, data) {
	if (err) throw err;
	assert.strictEqual(data, 'failed');
});

// parallel
// --------

var parallelFlow = async(function *() {
	var a = function(f) { fs.readFile(file1, 'utf8', f); };
	var b = function(f) { fs.readFile(non_existent, 'utf8', f); };
	try {
		var results = yield async.join(a, b);
		return results[0] + results[1];		
	} catch (e) {
		return 'failed';
	}
});

parallelFlow(function (err, data) {
	if (err) throw err;
	assert.strictEqual(data, 'failed');
});
