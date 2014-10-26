
/* lexical grammar */
%lex
%%

\s*\n\s*       {/*ignore*/ }
\s*\=\s*       { return '='; }
\n             { return 'NEWLINE'; }
[a-zA-Z]+      { return 'VAR'; }
\s+            { return 'APPLICATION'; }
\\             { return 'LAMBDA'; }
'.'            { return '.'; }
'('            { return '('; }
')'            { return ')'; }
<<EOF>>        { return 'EOF'; }

/lex

/* operator associations and precedence */

%left 'APPLICATION'
%right 'LAMBDA'

%start program

%% /* language grammar */

program
    : instructions EOF
        { return $1; }
    ;

instructions
    : instruction NEWLINE
        { $$ = $1; }
    | instruction instructions
        { $$ = {node: 'INSTRUCTIONS', first: $1, rest: $2}; }
    | instruction
        { $$ = $1; }
    ;

instruction
    : e
        { $$ = $1; }
    | VAR '=' e
        { $$ = {node: 'ASSIGNMENT', name: $1, expr: $3}; }
    ;

e
    : LAMBDA VAR '.' e
        { $$ = {node: 'LAMBDA', var: $2, body: $4}; }
    | e APPLICATION e
        { $$ = {node: 'APPLICATION', left: $1, right: $3}; }
    | VAR
        { $$ = {node: 'VAR', name: $1}; }
    | '(' e ')'
        { $$ = $2; }
    ;

