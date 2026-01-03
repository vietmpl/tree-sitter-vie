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

export default grammar({
	name: "vie",

	// Allow all whitespace characters except line breaks.
	extras: _ => [/[^\S\r\n]/],

	externals: $ => [$.text, $._newline, $.error_sentinel],

	word: $ => $.identifier,

	rules: {
		source_file: $ => repeat($._node),

		_node: $ =>
			choice(
				$.text,
				$.comment_tag,
				$.render,
				$.if_tag,
				$.else_tag,
				$.else_if_tag,
				$.end_tag,
				$.switch_tag,
				$.case_tag,
			),

		comment: _ => repeat1(choice(/[^#\r\n]+/, "#")),

		comment_tag: $ => seq("{#", optional($.comment), "#}"),

		render: $ => seq("{{", $._expression, "}}"),

		end_tag: $ => tag("end", $._newline),

		if_tag: $ => tag(seq("if", $._expression), $._newline),

		else_if_tag: $ => tag(seq("else", "if", $._expression), $._newline),

		else_tag: $ => tag("else", $._newline),

		switch_tag: $ => tag(seq("switch", $._expression), $._newline),

		case_tag: $ => tag(seq("case", $.expression_list), $._newline),

		expression_list: $ => seq(sepBy1(",", $._expression), optional(",")),

		_expression: $ =>
			choice(
				$.binary_expression,
				$.unary_expression,
				$.pipe_expression,
				$.call_expression,
				$.boolean_literal,
				$.string_literal,
				$.identifier,
				$.parenthesized_expression,
			),

		identifier: _ => /[@_]?[\p{XID_Start}]\p{XID_Continue}*/u,

		boolean_literal: _ => choice("true", "false"),

		string_literal: $ =>
			choice(
				seq(
					"'",
					repeat(
						choice(token.immediate(prec(1, /[^'\\\r\n]+/)), $.escape_sequence),
					),
					token.immediate("'"),
				),
				seq(
					'"',
					repeat(
						choice(token.immediate(prec(1, /[^"\\\r\n]+/)), $.escape_sequence),
					),
					token.immediate('"'),
				),
			),

		escape_sequence: _ =>
			token.immediate(
				seq(
					"\\",
					choice(
						/[^xuU]/,
						/u[0-9a-fA-F]{4}/,
						/U[0-9a-fA-F]{8}/,
						/x[0-9a-fA-F]{2}/,
					),
				),
			),

		call_expression: $ =>
			prec.left(
				PREC.call,
				seq(
					field("function", $.identifier),
					field("arguments", $.argument_list),
				),
			),

		argument_list: $ => seq("(", sepBy(",", $._expression), optional(","), ")"),

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
				[PREC.additive, "~"],
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

		parenthesized_expression: $ => seq("(", $._expression, ")"),
	},
});

/**
 * Wraps a rule or literal between `{%` and `%}` delimiters.
 *
 * @param {RuleOrLiteral} content
 * @param {RuleOrLiteral} newline
 * @returns {SeqRule}
 */
function tag(content, newline) {
	return seq("{%", content, "%}", newline);
}

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
