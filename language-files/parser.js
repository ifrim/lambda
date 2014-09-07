var fs = require('fs'),
	jison = require('jison'),
	bnf,
	parser;

bnf = fs.readFileSync('./language-files/grammar.jison', 'utf8');
parser = new jison.Parser(bnf);

module.exports = parser;
