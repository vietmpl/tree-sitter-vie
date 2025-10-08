/**
 * @file Vie grammar for tree-sitter
 * @author nickshiro <rudbsm@gmail.com>
 * @author skewb1k <skewb1kunix@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
	call: 4,
	unary: 3,
	binary: 2,
	// TODO: add '||' and '&&'
	// and: 1,
	// or: 0
};

module.exports = grammar({
	name: "vie",

	externals: $ => [$.text],
	conflicts: $ => [[$._else_clause], [$._else_if_clause], [$._case_clause]],

	rules: {
		source_file: $ => repeat($._node),

		_node: $ => choice($.text, $.render_block, $.comment_block, $._statement),

		comment_block: _ => seq("{#", repeat(choice(/[^#]+/, "#")), "#}"),

		render_block: $ => seq("{{", optional($._expression), "}}"),

		_statement: $ => choice($.if_block, $.switch_block),

		if_block: $ =>
			seq(
				"{%",
				"if",
				field("condition", $._expression),
				"%}",
				field("consequence", repeat($._node)),
				repeat($._else_if_clause),
				optional(field("alternative", $._else_clause)),
				"{%",
				"end",
				"%}",
			),

		_else_if_clause: $ =>
			seq(
				"{%",
				"else",
				"if",
				field("condition", $._expression),
				"%}",
				field("consequence", repeat($._node)),
			),

		_else_clause: $ => seq("{%", "else", "%}", repeat($._node)),

		switch_block: $ =>
			seq(
				"{%",
				"switch",
				field("value", $._expression),
				"%}",
				repeat(choice($._case_clause, $.comment_block)),
				"{%",
				"end",
				"%}",
			),

		_case_clause: $ =>
			seq("{%", "case", field("value", $._expression), "%}", repeat($._node)),

		// TODO: disallow @_?
		identifier: _ => /@?[_\p{XID_Start}][_\p{XID_Continue}]*/u,

		boolean_literal: _ => choice("true", "false"),
		string_literal: _ =>
			token(choice(seq("'", /[^'\n]*/, "'"), seq('"', /([^"\n])*/, '"'))),

		_literal: $ => choice($.boolean_literal, $.string_literal),

		arguments: $ => seq("(", sepBy(",", $._expression), optional(","), ")"),
		call_expression: $ =>
			prec(
				PREC.call,
				seq(field("function", $.identifier), field("arguments", $.arguments)),
			),

		pipe_expression: $ =>
			prec(
				PREC.call,
				seq(
					field("argument", $._expression),
					"|",
					field("function", $.identifier),
				),
			),

		unary_operator: _ => "!",
		unary_expression: $ =>
			prec(
				PREC.unary,
				seq(
					field("operator", $.unary_operator),
					field("operand", $._expression),
				),
			),

		binary_operator: _ => choice("==", "!=", "<", ">", "<=", ">="),
		binary_expression: $ =>
			prec.left(
				PREC.binary,
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
				$.identifier,
				$.pipe_expression,
				$.call_expression,
				$.unary_expression,
				$.binary_expression,
				$._parenthesized_expression,
			),
	},
});

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
