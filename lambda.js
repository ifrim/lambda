var fs = require('fs'),
	parser = require('./language-files/parser.js'),
	repl = require('repl'),
	_ = require('lodash'),
	ast,
	source = '',
    scope = {};

if(process.argv[2]) {
	source = fs.readFileSync('./' + process.argv[2], 'utf8');
	ast = parser.parse(source);
	console.log(toString(ast));
	console.log('=> ' + toString(evalInstructions(ast)));
	console.log('SCOPE', scope);
} else {
	repl.start({
		prompt: 'lambda> ',
		ignoreUndefined: true,
		eval: function(cmd, context, file, callback) {
			var ast = parser.parse(cmd.replace('\n', ''));
			console.log(toString(evalInstructions(ast)));
			callback(null, undefined);
		}
	});
}

function toString(ast) {
	switch(ast.node) {
		case 'VAR': return ast.name; break;
		case 'LAMBDA': return '\\' + ast.var + '.' + toString(ast.body); break;
		case 'APPLICATION': return '(' + toString(ast.left) + ' ' + toString(ast.right) + ')'; break;
        case 'INSTRUCTIONS': return toString(ast.first) + '\n' + toString(ast.rest); break;
        case 'ASSIGNMENT': return ast.name + ' = ' + toString(ast.expr); break;
	}
}

/**
 * In expression 'e1' substitutes the variable 'v' with expression 'e2'
 * @param {object} e1 - the expression to replace into
 * @param {string} v - the variable to replace
 * @param {object} e2 - the expression to replace with
 * @return {object} the expression e1 with the variable v replaced by expression e2
 */
function s(e1, v, e2) {
	e1 = _.merge({}, e1);
	e2 = _.merge({}, e2);
	switch(e1.node) {
		case 'VAR':
			return e1.name === v ? e2 : e1;
            break;
		case 'LAMBDA':
			e1.body = s(e1.body, v, e2);
			return e1;
            break;
		case 'APPLICATION':
			e1.left = s(e1.left, v, e2);
			e1.right = s(e1.right, v, e2);
			return e1;
            break;
	}
}

function evalExpression(ast) {
	var result;

	switch(ast.node) {
		case 'VAR':
		case 'LAMBDA':
			result = ast;
			break;
		case 'APPLICATION':
			if(ast.left.node === 'APPLICATION') {
				ast.left = evalExpression(ast.left);
				result = evalExpression(ast);
			} else if(ast.right.node === 'APPLICATION') {
				ast.right = evalExpression(ast.right);
				result = evalExpression(ast);
			} else {
				result = ast.left.node === 'LAMBDA' ?
					s(ast.left.body, ast.left.var, ast.right) :
					ast;
			}
			break;
	}

	return result.node === 'APPLICATION' && result.left.node !== 'VAR' ? evalExpression(result) : result;
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
            return evalExpression(ast);
            break;
    }
}
