#include "tree_sitter/parser.h"

enum TokenType {
  TEXT,
};

void *tree_sitter_vie_external_scanner_create() { return NULL; }
void tree_sitter_vie_external_scanner_destroy(void *p) {}
unsigned tree_sitter_vie_external_scanner_serialize(void *p, char *b) {
  return 0;
}
void tree_sitter_vie_external_scanner_deserialize(void *p, const char *b,
                                                  unsigned n) {}

bool tree_sitter_vie_external_scanner_scan(void *p, TSLexer *l,
                                           const bool *valid_symbols) {
  if (!valid_symbols[TEXT]) {
    return false;
  }

  bool has_content = false;

  while (l->lookahead == ' ' || l->lookahead == '\t') {
    has_content = true;
    l->advance(l, true);
  }

  if (l->lookahead == '\n') {
    has_content = true;
    l->advance(l, true);
  } else if (l->lookahead == '\r') {
    has_content = true;
    l->advance(l, true);
    if (l->lookahead == '\n')
      l->advance(l, true);
  }

  while (!l->eof(l)) {
    if (l->lookahead == '{') {
      l->mark_end(l);
      l->advance(l, false);
      int next = l->lookahead;

      if (next == '%' || next == '{' || next == '#') {
        return has_content; // Do NOT emit if nothing was read
      }
    } else {
      l->advance(l, false);
    }
    has_content = true;
  }

  if (!has_content) {
    return false;
  }
  l->result_symbol = TEXT;
  l->mark_end(l);
  return true;
}
