/**
 * @file Vie grammar for tree-sitter
 * @author skewb1k <skewb1kunix@gmail.com>
 * @author nickshiro <rudbsm@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "vie",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
