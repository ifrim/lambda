var fs = require('fs'),
	parser = require('./parser.js'),
	source = '',
	util = require('util');

if(process.argv[2]) {
	source = fs.readFileSync('./' + process.argv[2], 'utf8');
}

var ast = parser.parse(source);

console.log(util.inspect(ast, {depth: null}));
