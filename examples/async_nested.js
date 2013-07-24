var assert = require('assert');
var path = require('path');
var fs = require('fs');
var mflow = require('..');
var async = mflow.async;

var file1 = path.join(__dirname, 'file1.txt');
var file2 = path.join(__dirname, 'file2.txt');

var sequenceFlow = async(function *() {
	var a = yield function(f) { fs.readFile(file1, 'utf8', f); };
	var b = yield function(f) { fs.readFile(file2, 'utf8', f); };
	return a + b;
});

var parallelFlow = async(function *() {
	var a = function(f) { fs.readFile(file1, 'utf8', f); };
	var b = function(f) { fs.readFile(file2, 'utf8', f); };
	var results = yield async.join(a, b);
	return results[0] + results[1];
});

mainFlow = async(function *() {
	var a = yield sequenceFlow;
	var b = yield parallelFlow;
	return a + b;
});

mainFlow(function (err, data) {
	if (err) throw err;
	assert.strictEqual(data, 'FILE1\r\nFILE2\r\nFILE1\r\nFILE2\r\n');
});


