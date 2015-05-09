var _ = require('lodash'),
    util = require('util');

var newVariableId = 1,
    scope = {};

module.exports = {
	toString: toString,
	addVariableIds: addVariableIds,
	getFreeVariables: getFreeVariables,
	betaReduction: betaReduction,
	evalExpression: evalExpression,
	evalInstructions: evalInstructions,
	scope: scope
};

function toString(ast) {
	switch(ast.node) {
		case 'VAR': return ast.name + '_' + ast.varId; break;
		case 'LAMBDA': return '\\' + ast.var + '.' + toString(ast.body); break;
		case 'APPLICATION': return '(' + toString(ast.left) + ' ' + toString(ast.right) + ')'; break;
        case 'INSTRUCTIONS': return toString(ast.first) + '\n' + toString(ast.rest); break;
        case 'ASSIGNMENT': return ast.name + ' = ' + toString(ast.expr); break;
	}
}

function addVariableIds(ast) {
	switch(ast.node) {
		case 'VAR':
			ast.varId = newVariableId++;
			break;
		case 'LAMBDA':
			addVariableIds(ast.body);
			break;
		case 'APPLICATION':
			addVariableIds(ast.left);
			addVariableIds(ast.right);
			break;
		case 'INSTRUCTIONS':
			addVariableIds(ast.first);
			addVariableIds(ast.rest);
			break;
		case 'ASSIGNMENT': addVariableIds(ast.expr); break;
	}

	return ast;
}

function getFreeVariables(ast, boundVariableNames) {
	var bindings = boundVariableNames || [],
	    freeVariables = [];

	switch(ast.node) {
		case 'VAR':
			if(bindings.indexOf(ast.name) === -1) {
				freeVariables.push(ast);
			}
			break;
		case 'LAMBDA':
			bindings = bindings.concat([ast.var]);
			freeVariables = freeVariables.concat(getFreeVariables(ast.body, bindings));
			break;
		case 'APPLICATION':
			freeVariables = freeVariables.concat(getFreeVariables(ast.left, bindings));
			freeVariables = freeVariables.concat(getFreeVariables(ast.right, bindings));
			break;
		case 'INSTRUCTIONS':
			freeVariables = freeVariables.concat(getFreeVariables(ast.first, bindings));
			freeVariables = freeVariables.concat(getFreeVariables(ast.rest, bindings));
			break;
		case 'ASSIGNMENT':
			freeVariables = freeVariables.concat(getFreeVariables(ast.expr, bindings));
			break;
	}

	return freeVariables;
}

function betaReduction(applicationExpression) {
	var vars,
	    lambdaExpression = applicationExpression.left,
	    substituteExpression = applicationExpression.right;

	vars = getFreeVariables(lambdaExpression.body).filter(function(varObj) {
		return varObj.name === lambdaExpression.var;
	}).map(function(varObj) {
		return varObj.varId;
	});

	// newVariableId = 1;
	applicationExpression = substitute(lambdaExpression.body, vars, substituteExpression);

	return applicationExpression;
}

/**
 * In expression 'e1' substitutes the variable 'v' with expression 'e2'
 * @param {object} e1 - the expression to replace into
 * @param {array} v - an array of variable ids to replace
 * @param {object} e2 - the expression to replace with
 * @return {object} the expression e1 with the variable v replaced by expression e2
 */
function substitute(e1, vars, e2) {
	e1 = _.merge({}, e1);
	e2 = _.merge({}, e2);
	switch(e1.node) {
		case 'VAR':
			return vars.indexOf(e1.varId) !== -1 ? e2 : e1;
            break;
		case 'LAMBDA':
			e1.body = substitute(e1.body, vars, e2);
			return e1;
            break;
		case 'APPLICATION':
			e1.left = substitute(e1.left, vars, e2);
			e1.right = substitute(e1.right, vars, e2);
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
					betaReduction(ast) :
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
            scope[ast.name] = evalExpression(ast.expr);
            return scope[ast.name];
            break;
        default:
            return evalExpression(ast);
            break;
    }
}
