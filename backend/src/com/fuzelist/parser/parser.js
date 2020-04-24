const chevrotain = require("chevrotain")
const { Lexer, CstParser } = chevrotain

// ----------------- lexer -----------------
const allTokens = []

// Utility to avoid manually building the allTokens array
function createToken(options) {
  const newToken = chevrotain.createToken(options)
  allTokens.push(newToken)
  return newToken
}

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
})

const LCurly = createToken({ name: "LCurly", pattern: /{/ })
const RCurly = createToken({ name: "RCurly", pattern: /}/ })
const LParen = createToken({ name: "LParen", pattern: /\(/ })
const RParen = createToken({ name: "RParen", pattern: /\)/ })
const SemiColon = createToken({ name: "SemiColon", pattern: /;/ })
const Equals = createToken({ name: "Equals", pattern: /=/ })
const LessThan = createToken({ name: "LessThan", pattern: /</ })
const Plus = createToken({ name: "Plus", pattern: /\+/ })
const Minus = createToken({ name: "Minus", pattern: /-/ })
const Mul = createToken({ name: "Mul", pattern: /\*/ })
const Div = createToken({ name: "Div", pattern: /\// })
const INT = createToken({ name: "Int", pattern: /[+-]?(([1-9](_\d|\d)*)|0)/ })
// TODO: resolve ambiguity keywords vs identifiers
const ID = createToken({ name: "ID", pattern: /[A-Za-z0-9_-]+/ })

const TinyCLexer = new Lexer(allTokens)

// ----------------- parser -----------------

class TinyCParser extends CstParser {
  // Unfortunately no support for class fields with initializer in ES2015, only in esNext...
  // so the parsing rules are defined inside the constructor, as each parsing rule must be initialized by
  // invoking RULE(...)
  // see: https://github.com/jeffmo/es-class-fields-and-static-properties
  constructor() {
    super(allTokens)

    // not mandatory, using $ (or any other sign) to reduce verbosity (this. this. this. this. .......)
    const $ = this

    $.RULE("program", () => {
      $.MANY(() => {
        $.SUBRULE($.statement)
      })
    })

    $.RULE("statement", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.blockStatement) },
        { ALT: () => $.SUBRULE($.expressionStatement) },
        { ALT: () => $.SUBRULE($.emptyStatement) }
      ])
    })

    $.RULE("blockStatement", () => {
      $.CONSUME(LCurly)
      $.MANY(() => {
        $.SUBRULE($.statement)
      })
      $.CONSUME(RCurly)
    })

    $.RULE("expressionStatement", () => {
      $.SUBRULE($.expression)
      $.CONSUME(SemiColon)
    })

    $.RULE("expression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.assignExpression) },
        { ALT: () => $.SUBRULE($.relationExpression) }
      ])
    })

    $.RULE("relationExpression", () => {
      $.SUBRULE($.AdditionExpression)
      $.MANY(() => {
        $.CONSUME(LessThan)
        $.SUBRULE2($.AdditionExpression)
      })
    })

    $.RULE("AdditionExpression", () => {
      $.SUBRULE($.term)
      $.MANY(() => {
        $.OR([{ ALT: () => $.CONSUME(Plus) }, { ALT: () => $.CONSUME(Minus) }])
        $.SUBRULE2($.term)
      })
    })

    $.RULE("MultiplyExpression", () => {
      $.SUBRULE($.term)
      $.MANY(() => {
        $.OR([{ ALT: () => $.CONSUME(Mul) }, { ALT: () => $.CONSUME(Div) }])
        $.SUBRULE2($.term)
      })
    })

    $.RULE("assignExpression", () => {
      $.CONSUME(ID)
      $.CONSUME(Equals)
      $.SUBRULE($.expression)
    })

    $.RULE("accessorExpression", () => {
      $.CONSUME($.expression)
      $.CONSUME(Equals)
      $.SUBRULE($.expression)
    })

    $.RULE("term", () => {
      $.OR([
        { ALT: () => $.CONSUME(ID) },
        { ALT: () => $.CONSUME(INT) },
        { ALT: () => $.SUBRULE($.paren_expr) }
      ])
    })

    $.RULE("paren_expr", () => {
      $.CONSUME(LParen)
      $.SUBRULE($.expression)
      $.CONSUME(RParen)
    })

    $.RULE("emptyStatement", () => {
      $.CONSUME(SemiColon)
    })

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis()
  }
}

// ----------------- wrapping it all together -----------------

// reuse the same parser instance.
const parser = new TinyCParser()

module.exports = function () {
  return {
      lexer: TinyCLexer,
      parser: parser
  }
}