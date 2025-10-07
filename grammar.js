/**
 * @file Vie grammar for tree-sitter
 * @author nickshiro <rudbsm@gmail.com>
 * @author skewb1k <skewb1kunix@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// https://github.com/tree-sitter/tree-sitter-rust/
/**
 * Creates a rule to match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function sepBy1(sep, rule) {
	return seq(rule, repeat(seq(sep, rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function sepBy(sep, rule) {
	return optional(sepBy1(sep, rule));
}

module.exports = grammar({
	name: "vie",

	rules: {
		source_file: $ => repeat($._node),
		_node: $ => choice($._expression),

		/*
		 * Identifier
		 */
		user_identifier: _ => token(/(r#)?[_\p{XID_Start}][_\p{XID_Continue}]*/u),
		builtin_identifier: _ =>
			token(seq("@", /(r#)?[_\p{XID_Start}][_\p{XID_Continue}]*/u)),

		_identifier: $ => choice($.user_identifier, $.builtin_identifier),

		/*
		 * Literal
		 */
		boolean: _ => choice("true", "false"),
		string: _ =>
			token(choice(seq("'", /[^'\n]*/, "'"), seq('"', /([^"\n])*/, '"'))),

		_literal: $ => choice($.boolean, $.string),

		/*
		 * Expression
		 */

		// Call expression
		arguments: $ => seq("(", sepBy(",", $._expression), optional(","), ")"),
		call_expression: $ =>
			prec(
				5,
				seq(field("function", $._identifier), field("arguments", $.arguments)),
			),

		// Pipe expression
		pipe_expression: $ =>
			prec(
				4,
				seq(
					field("argument", $._expression),
					"|",
					field("function", $._identifier),
				),
			),

		// Unary expression
		unary_operator: _ => "!",
		unary_expression: $ =>
			prec(
				3,
				seq(
					field("operator", $.unary_operator),
					field("operand", $._expression),
				),
			),

		// Binary expression
		binary_operator: _ => choice("==", "!=", "<", ">", "<=", ">="),
		binary_expression: $ =>
			prec.left(
				2,
				seq(
					field("left", $._expression),
					field("operator", $.binary_operator),
					field("right", $._expression),
				),
			),

		_parenthesized_expression: $ => seq("(", $._expression, ")"),

		_expression: $ =>
			choice(
				$._literal,
				$._identifier,
				$.pipe_expression,
				$.call_expression,
				$.unary_expression,
				$.binary_expression,
				$._parenthesized_expression,
			),
	},
});
