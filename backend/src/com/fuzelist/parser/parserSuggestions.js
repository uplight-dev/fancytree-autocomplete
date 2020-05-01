const _ = require("lodash")
const {
  createToken,
  Lexer,
  CstParser,
  tokenMatcher,
  EMPTY_ALT
} = require("chevrotain")

const {lexer, Parser, ID} = require("./parser")

/**
 * @param text {string} - The text content assist is requested immediately afterwards.
 * @param symbolTable {string[]} - List of available symbol names.
 */
function getContentAssistSuggestions(text, symbolFinder) {
  var parser = new Parser()
  const lexResult = lexer.tokenize(text)
  if (lexResult.errors.length > 0) {
    throw new Error("sad sad panda, lexing errors detected")
  }

  parser.input = lexResult.tokens;

  const lastInputToken = _.last(lexResult.tokens)
  let partialMode = false
  let assistTokens = lexResult.tokens

  let suggestions = parser.computeContentAssist(
    "start",
    assistTokens
  )

  // we have requested assistance while inside a Keyword or Identifier
  if (
    lastInputToken !== undefined &&
    (tokenMatcher(lastInputToken, ID)) &&
    /\w/.test(text[text.length - 1])
  ) {
    assistTokens = _.dropRight(assistTokens)
    //redo suggestions with the last ID Token included and aggregate
    const suggestions2 = parser.computeContentAssist(
      "start",
      assistTokens
    )
    suggestions = suggestions.concat(suggestions2)

    partialMode = true
  }

  let outSuggestions = []
  let outIdSuggestions = []

  for (let i = 0; i < suggestions.length; i++) {
    const cSuggestion = suggestions[i]
    const cTokenType = cSuggestion.nextTokenType
    const cRuleStack = cSuggestion.ruleStack

    if (cTokenType === ID) {
      let symbols = symbolFinder(cRuleStack);
      outIdSuggestions = outSuggestions.concat(symbols);
    } else {
      outSuggestions.push(cTokenType.LABEL || cTokenType.PATTERN.source.replace('\\', ''));
    }
  }

  // throw away any suggestion that is not a suffix of the last partialToken.
  if (partialMode) {
    outIdSuggestions = _.filter(outIdSuggestions, (s) => {
      return _.startsWith(s, lastInputToken.image)
    })
  }

  outSuggestions = outSuggestions.concat(outIdSuggestions)
  // we could have duplication because each suggestion also includes a Path, and the same Token may appear in multiple suggested paths.
  return _.uniq(outSuggestions)
}

module.exports = {
  getSuggestions: getContentAssistSuggestions
}