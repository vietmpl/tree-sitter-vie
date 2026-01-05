[
  "{{"
  "}}"
  "{%"
  "%}"
  "("
  ")"
] @punctuation.bracket

"," @punctuation.delimiter

(comment_tag) @comment

[
  "if"
  "elseif"
  "else"
  "end"
  "or"
  "and"
] @keyword

[
  "!="
  "=="
  "!"
  "~"
  "|"
] @operator

(identifier) @variable

(pipe_expression
  function: (identifier) @function.call)

(call_expression
  function: (identifier) @function.call)

(boolean_literal) @boolean

(string_literal) @string

(escape_sequence) @string.escape

(conditional_expression
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)
