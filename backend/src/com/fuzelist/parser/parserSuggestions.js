/*
 * Example Of using Chevrotain's built in syntactic content assist
 * To implement semantic content assist and content assist on partial inputs.
 *
 * Examples:
 * "Public static " --> ["function"]
 * "Public sta" --> ["static"]
 * "call f" --> ["foo"] // assuming foo is in the symbol table.
 */
const parser = require("./parser")()

function getContentAssistSuggestions(text) {
  const lexResult = parser.lexer.tokenize(text)
  if (lexResult.errors.length > 0) {
    throw new Error("sad sad panda, lexing errors detected")
  }
  const partialTokenVector = lexResult.tokens

  const syntacticSuggestions = parser.parser.computeContentAssist(
    "blockStatement",
    partialTokenVector
  )

  // The suggestions also include the context, we are only interested
  // in the TokenTypes in this example.
  const tokenTypesSuggestions = syntacticSuggestions.map(
    (suggestion) => suggestion.nextTokenType
  )

  return tokenTypesSuggestions
}

module.exports = {
  getSuggestions: getContentAssistSuggestions
}