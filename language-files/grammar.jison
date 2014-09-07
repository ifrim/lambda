
/* lexical grammar */
%lex
%%

\s*\n\s*			{/*ignore*/ }
[a-zA-Z]+			{ return 'VAR'; }
\s+					{ return 'APPLICATION'; }
\\					{ return 'LAMBDA'; }
'.'					{ return '.' }
'('					{ return '(' }
')'					{ return ')' }
<<EOF>>             { return 'EOF'; }

/lex

/* operator associations and precedence */

%left 'APPLICATION'
%right 'LAMBDA'

%start expressions

%% /* language grammar */

expressions
    : e EOF
         { return $1; }
    ;

e
	: LAMBDA VAR '.' e
        { $$ = {node: 'LAMBDA', var: $2, body: $4}; }
    | e APPLICATION e
        { $$ = {node: 'APPLICATION', e1: $1, e2: $3}; }
    | VAR 
		{ $$ = {node: 'VAR', value: $1}; }
	| '(' e ')'
		{ $$ = $2; }
    ;

