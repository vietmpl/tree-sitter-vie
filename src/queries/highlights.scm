[
  "{%"
  "%}"
  "("
  ")"
] @punctuation.bracket

(comment_block) @comment

[
  "if"
  "else"
  "switch"
  "case"
  "end"
] @keyword

;; Operators
[
  (binary_operator)
  "!"
] @operator

;; Pipes
(pipe_expression
  "|" @operator
  function: (identifier) @function)

;; Function call
(call_expression
  function: (identifier) @function)

[
  ","
] @punctuation.delimiter

;; Variables
(identifier) @variable

;; Literals
(string_literal) @constant.builtin
(boolean_literal) @constant.builtin
