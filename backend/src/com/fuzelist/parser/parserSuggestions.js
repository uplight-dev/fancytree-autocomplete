/*
 * Example Of using Chevrotain's built in syntactic content assist
 * To implement semantic content assist and content assist on partial inputs.
 *
 * Examples:
 * "Public static " --> ["function"]
 * "Public sta" --> ["static"]
 * "call f" --> ["foo"] // assuming foo is in the symbol table.
 */
const _ = require("lodash")
const {
  createToken,
  Lexer,
  CstParser,
  tokenMatcher,
  EMPTY_ALT
} = require("chevrotain")

const parser = require("./parser")()

// function getContentAssistSuggestions(text) {
//   const lexResult = parser.lexer.tokenize(text)
//   if (lexResult.errors.length > 0) {
//     throw new Error("sad sad panda, lexing errors detected")
//   }
//   const partialTokenVector = lexResult.tokens

//   const syntacticSuggestions = parser.parser.computeContentAssist(
//     "program",
//     partialTokenVector
//   )

//   // The suggestions also include the context, we are only interested
//   // in the TokenTypes in this example.
//   const tokenTypesSuggestions = syntacticSuggestions.map(
//     (suggestion) => suggestion.nextTokenType
//   )

//   return tokenTypesSuggestions
// }

/**
 * @param text {string} - The text content assist is requested immediately afterwards.
 * @param symbolTable {string[]} - List of available symbol names.
 */
function getContentAssistSuggestions(text, symbolTable) {
  const lexResult = parser.lexer.tokenize(text)
  if (lexResult.errors.length > 0) {
    throw new Error("sad sad panda, lexing errors detected")
  }

  const lastInputToken = _.last(lexResult.tokens)
  let partialSuggestionMode = false
  let assistanceTokenVector = lexResult.tokens

  // we have requested assistance while inside a Keyword or Identifier
  if (
    lastInputToken !== undefined &&
    (tokenMatcher(lastInputToken, parser.ID)) &&
    /\w/.test(text[text.length - 1])
  ) {
    assistanceTokenVector = _.dropRight(assistanceTokenVector)
    partialSuggestionMode = true
  }

  const syntacticSuggestions = parser.parser.computeContentAssist(
    "start",
    assistanceTokenVector
  )

  let finalSuggestions = []

  for (let i = 0; i < syntacticSuggestions.length; i++) {
    const currSyntaxSuggestion = syntacticSuggestions[i]
    const currTokenType = currSyntaxSuggestion.nextTokenType
    const currRuleStack = currSyntaxSuggestion.ruleStack
    const lastRuleName = _.last(currRuleStack)

    // easy case where a keyword is suggested.
    if (parser.ID.categoryMatchesMap[currTokenType.tokenTypeIdx]) {
      finalSuggestions.push(currTokenType.PATTERN.source)
    }
  }

  // throw away any suggestion that is not a suffix of the last partialToken.
  if (partialSuggestionMode) {
    finalSuggestions = _.filter(finalSuggestions, (currSuggestion) => {
      return _.startsWith(currSuggestion, lastInputToken.image)
    })
  }

  // we could have duplication because each suggestion also includes a Path, and the same Token may appear in multiple suggested paths.
  return _.uniq(finalSuggestions)
}

module.exports = {
  getSuggestions: getContentAssistSuggestions
}