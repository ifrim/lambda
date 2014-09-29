var fs = require('fs'),
	parser = require('./language-files/parser.js'),
	util = require('util'),
	print = function(obj) {
		console.log(util.inspect(obj, {depth: null}));
	},
	source = '',
    scope = {};

if(process.argv[2]) {
	source = fs.readFileSync('./' + process.argv[2], 'utf8');
}

var ast = parser.parse(source);

function show(ast) {
	switch(ast.node) {
		case 'VAR': return ast.value; break;
		case 'LAMBDA': return '\\' + ast.var + '.' + show(ast.body); break;
		case 'APPLICATION': return '(' + show(ast.e1) + ' ' + show(ast.e2) + ')'; break;
        case 'INSTRUCTIONS': return show(ast.first) + '\n' + show(ast.rest); break;
        case 'ASSIGNMENT': return ast.name + ' = ' + show(ast.expr); break;
	}
}

/**
 * In expression 'e1' substitutes the variable 'v' with expression 'e2'
 */
function s(e1, v, e2) {
	switch(e1.node) {
		case 'VAR':
			return e1.value === v ? e2 : e1;
            break;
		case 'LAMBDA':
			e1.body = s(e1.body, v, e2);
			return e1;
            break;
		case 'APPLICATION':
			e1.e1 = s(e1.e1, v, e2);
			e1.e2 = s(e1.e2, v, e2);
			return e1;
            break;
	}
}

function eval(ast) {
	var result;

	switch(ast.node) {
		case 'VAR': result = ast; break;
		case 'LAMBDA': result = ast; break;
		case 'APPLICATION':
			if(ast.e1.node === 'APPLICATION' || ast.e2.node === 'APPLICATION') {
				ast.e1 = eval(ast.e1);
				ast.e2 = eval(ast.e2);
				result = eval(ast);
			} else {
				result = ast.e1.node === 'LAMBDA' ?
					s(ast.e1.body, ast.e1.var, ast.e2) :
					ast;
			}
			break;
	}

	return result.node === 'APPLICATION' ? eval(result) : result;
}

function evalInstructions(ast) {
    switch(ast.node) {
        case 'INSTRUCTIONS':
            evalInstructions(ast.first);
            return evalInstructions(ast.rest);
            break;
        case 'ASSIGNMENT':
            scope[ast.name] = eval(ast.expr);
            return scope[ast.name];
            break;
        default:
            return eval(ast);
            break;
    }
}

//print(ast);
console.log(show(ast));
console.log('=> ' + show(evalInstructions(ast)));
console.log('SCOPE', scope);
