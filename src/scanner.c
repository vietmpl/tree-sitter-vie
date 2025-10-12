#include "tree_sitter/parser.h"

enum TokenType {
  TEXT_BLOCK,
};

void *tree_sitter_vie_external_scanner_create() { return NULL; }
void tree_sitter_vie_external_scanner_destroy(void *p) {}
unsigned tree_sitter_vie_external_scanner_serialize(void *p, char *b) {
  return 0;
}
void tree_sitter_vie_external_scanner_deserialize(void *p, const char *b,
                                                  unsigned n) {}

static inline void advance(TSLexer *l) { l->advance(l, false); }

bool tree_sitter_vie_external_scanner_scan(void *p, TSLexer *l,
                                           const bool *valid_symbols) {
  if (!valid_symbols[TEXT_BLOCK])
    return false;

  bool has_content = false;

  while (!l->eof(l)) {
    int c = l->lookahead;

    if (c == '{') {
      l->mark_end(l); // Mark end before checking next char
      advance(l);
      int next = l->lookahead;

      if (next == '%' || next == '{' || next == '#') {
        // Found tag start -> stop before this '{'
        return has_content; // Do NOT emit if nothing read yet
      }
      has_content = true;
      continue;
    }

    has_content = true;
    advance(l);
  }

  if (has_content) {
    l->result_symbol = TEXT_BLOCK;
    l->mark_end(l);
    return true;
  }

  return false;
}
