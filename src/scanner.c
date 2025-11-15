#include "tree_sitter/parser.h"

enum TokenType {
  TEXT,
  _NEWLINE,
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
  if (valid_symbols[_NEWLINE]) {
    while (l->lookahead == ' ' || l->lookahead == '\t') {
      advance(l);
    }

    if (l->lookahead == '\n') {
      advance(l);
    } else if (l->lookahead == '\r') {
      advance(l);
      if (l->lookahead == '\n')
        advance(l);
    }

    l->result_symbol = _NEWLINE;
    l->mark_end(l);
    return true;
  } else if (valid_symbols[TEXT]) {
    bool emit = false;

    while (!l->eof(l)) {
      if (l->lookahead == '{') {
        l->mark_end(l);
        advance(l);
        int next = l->lookahead;

        if (next == '%' || next == '{' || next == '#') {
          return emit; // Do NOT emit if nothing was read
        }
      } else {
        advance(l);
      }
      emit = true;
    }

    if (!emit) {
      return false;
    }
    l->result_symbol = TEXT;
    l->mark_end(l);
    return true;
  }
  return false;
}
