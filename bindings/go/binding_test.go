package tree_sitter_vie_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_vie "github.com/vietmpl/vie/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_vie.Language())
	if language == nil {
		t.Errorf("Error loading Vie grammar")
	}
}
