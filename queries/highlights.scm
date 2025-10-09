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
  "or"
  "||"
  "and"
  "&&"
  "<="
  ">="
  ">"
  "<"
  "!="
  "=="
  "is"
  "not"
  "is not"
  "!"
  ".."
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
(string_literal 
  escape: (escape_sequence) @string.escaped)

(boolean_literal) @constant.builtin
