/**
 * @file Vie grammar for tree-sitter
 * @author nickshiro <rudbsm@gmail.com>
 * @author skewb1k <skewb1kunix@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
	pipe: 7,
	call: 6,
	unary: 5,
	additive: 4,
	comparative: 3,
	and: 2,
	or: 1,
};

module.exports = grammar({
	name: "vie",

	externals: $ => [$.text],

	// TODO: this might not be needed if prec's values are specified correctly
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

		identifier: _ => /[@_]?[\p{XID_Start}]\p{XID_Continue}*/u,

		boolean_literal: _ => choice("true", "false"),

		escape_sequence: _ => seq("\\", /./),
		string_literal: $ =>
			choice(
				seq(
					"'",
					repeat(choice(/[^'\\\n]/, field("escape", $.escape_sequence))),
					"'",
				),
				seq(
					'"',
					repeat(choice(/[^"\\\n]/, field("escape", $.escape_sequence))),
					'"',
				),
			),

		_literal: $ => choice($.boolean_literal, $.string_literal),

		arguments: $ => seq("(", sepBy(",", $._expression), optional(","), ")"),
		call_expression: $ =>
			prec.left(
				PREC.call,
				seq(field("function", $.identifier), field("arguments", $.arguments)),
			),

		pipe_expression: $ =>
			prec.left(
				PREC.pipe,
				seq(
					field("argument", $._expression),
					"|",
					field("function", $.identifier),
				),
			),

		unary_expression: $ =>
			prec.left(
				PREC.unary,
				seq(
					field("operator", choice("!", "not")),
					field("operand", $._expression),
				),
			),

		binary_expression: $ => {
			const table = [
				[PREC.or, choice("or", "||")],
				[PREC.and, choice("and", "&&")],
				[
					PREC.comparative,
					choice(
						"==",
						"!=",
						"<",
						">",
						"<=",
						">=",
						"is",
						// Note: this hardcodes whitespaces instead of relying on 'extras'
						alias(/is\s+not/, "is not"),
					),
				],
				[PREC.additive, ".."],
			];

			return choice(
				...table.map(([precLevel, operator]) =>
					prec.left(
						// @ts-expect-error
						precLevel,
						seq(
							field("left", $._expression),
							// @ts-expect-error
							field("operator", operator),
							field("right", $._expression),
						),
					),
				),
			);
		},

		_parenthesized_expression: $ => seq("(", $._expression, ")"),
		_expression: $ =>
			choice(
				$.binary_expression,
				$.unary_expression,
				$.pipe_expression,
				$.call_expression,
				$._literal,
				$.identifier,
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
