lambda
======

A small research language based on [lambda calculus] (https://en.wikipedia.org/wiki/Lambda_calculus).

It uses [jison] (https://zaach.github.io/jison/about/) to generate the parser from a grammar file.

Installation
------------

It requires node with npm already installed on your computer.

After cloning the repo inside the project directory run:

	npm install

This will install all the dependencies, including jison.

That's it!

Running it
----------

There are two options to run it:

1. getting the source from a file

	> node lambda path/to/program

2. starting a repl

	> node lambda

Syntax
------

Lambda abstraction:

	\x.y

Application (space):

	\x.x a

Parens for nested applications:

	\x.\y.x (\i.i a) b

Assignment:

	identity = \x.x