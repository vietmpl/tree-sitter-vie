import XCTest
import SwiftTreeSitter
import TreeSitterVie

final class TreeSitterVieTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_vie())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Vie grammar")
    }
}
