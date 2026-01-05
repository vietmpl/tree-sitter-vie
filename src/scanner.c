#include "tree_sitter/parser.h"

enum TokenType {
  TEXT,
  ERROR_SENTINEL,
};

void *tree_sitter_vie_external_scanner_create() { return NULL; }
void tree_sitter_vie_external_scanner_destroy(void *p) {}
unsigned tree_sitter_vie_external_scanner_serialize(void *p, char *b) {
  return 0;
}
void tree_sitter_vie_external_scanner_deserialize(void *p, const char *b,
                                                  unsigned n) {}

static inline void advance(TSLexer *l) { l->advance(l, false); }

static inline bool process_text(TSLexer *l) {
  bool has_content = false;

  while (!l->eof(l)) {
    if (l->lookahead == '\\') {
      advance(l);

      if (l->eof(l)) {
        return false;
      }

      int next = l->lookahead;

      if (next == '\\' || next == '{') {
        advance(l);
        has_content = true;
        continue;
      }
      return false;
    }
    if (l->lookahead == '{') {
      l->mark_end(l);
      advance(l);
      if (l->eof(l)) {
        break;
      }
      int next = l->lookahead;

      if (next == '%' || next == '{' || next == '#') {
        return has_content; // Do not emit if nothing was read
      }
    } else {
      advance(l);
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

bool tree_sitter_vie_external_scanner_scan(void *p, TSLexer *l,
                                           const bool *valid_symbols) {
  // handle error recovery mode.
  if (valid_symbols[ERROR_SENTINEL]) {
    return false;
  }

  if (valid_symbols[TEXT]) {
    return process_text(l);
  }

  return false;
}
