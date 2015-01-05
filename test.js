var test = require('tape');
var mkdirp = require('mkdirp');
var find = require('./');

mkdirp.sync('./example/node_modules/b');

test('it works', function(assert) {
	find('./example', function(err, requires) {
		assert.deepEqual(requires, ['a', 'b', 'c']);
		assert.end();
	});
});

test('it can filter out installed modules', function(assert) {
	find('./example', { onlyMissing: true }, function(err, requires) {
		assert.deepEqual(requires, ['a', 'c']);
		assert.end();
	});
});
