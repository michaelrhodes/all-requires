var detective = require('detective');
var _ = require('lodash');
var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');
var async = require('async');
var core = require('is-core-module');
var local = /^\.|\//;

// Only js and not from node_modules
var onlySourceFiles = function(filename) {
	return filename
		&& filename.slice(filename.length - 3) === '.js'
		&& filename.indexOf('node_modules') === -1;
};

var onlyDependencies = function(filename) {
	return !local.test(filename)
		&& !core(filename);
};

var nodeModulePath = function(dir, filename) {
	return path.join(dir, '/node_modules/', filename);
};

var find = function(dir, opts, cb) {
	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	recursive(dir, function (err, filenames) {
		var jsFiles = filenames.filter(onlySourceFiles);

		var counter = 0;
		var requires = [];

		for (var i in jsFiles) {
			counter++;
			var filename = jsFiles[i];

			fs.readFile(filename, function(err, content) {
				if (err) {
					return cb(err, null);
				}

				counter--;
				requires = requires.concat(detective(content));

				if (counter === 0) {
					var filtered = _.unique(requires.filter(onlyDependencies));
					if (!opts.onlyMissing) {
						return cb(null, filtered);
					}
					async.filter(filtered, function(dep, next) {
						fs.exists(nodeModulePath(dir, dep), function(exists) {
							next(!exists ? dep : null);
						});
					}, function(deps) {
						cb(null, deps);
					});
				}
			});
		}
	});
};

module.exports = find;
