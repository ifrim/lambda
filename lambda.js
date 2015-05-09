#!/usr/bin/env node

var fs = require('fs'),
    repl = require('repl'),
    util = require('util'),
    parser = require('./language-files/parser.js'),
    $ = require('./language-files/core.js'),
    ast,
    source = '';

if(process.argv[2]) {
	source = fs.readFileSync('./' + process.argv[2], 'utf8');
	ast = $.addVariableIds(parser.parse(source));
	console.log($.toString(ast));
	// console.log(util.inspect(ast, {depth: null, colors: true}));
	console.log('=> ' + $.toString($.evalInstructions(ast)));
	console.log('SCOPE\n', Object.keys($.scope).map(function(k) {
		return '\t' + k + ' = ' + $.toString($.scope[k]);
	}).join('\n'));

	// var test = '\\x.\\y.(z (\\x.x a) x) g';
	// var testAst = $.addVariableIds(parser.parse(test));
	// // console.log(util.inspect(testAst, {depth: null}));
	// console.log($.toString(testAst));
	// var betaReduced = $.betaReduction(testAst);
	// console.log($.toString(betaReduced));
} else {
	repl.start({
		prompt: 'lambda> ',
		ignoreUndefined: true,
		eval: function(cmd, context, file, callback) {
			var ast = $.addVariableIds(parser.parse(cmd.replace('\n', '')));
			console.log($.toString($.evalInstructions(ast)));
			callback(null, undefined);
		}
	});
}
