//http://sap.github.io/chevrotain/playground/?example=JSON%20grammar%20only
//(Immo.loc ~ [WSL,WSP] or Immo.loc = Etterbeek) and (Immo.date > #now)

(function calculatorExampleCst() {
    "use strict";
    /**
     * An Example of implementing a Calculator with separated grammar and semantics (actions).
     * This separation makes it easier to maintain the grammar and reuse it in different use cases.
     *
     * This is accomplished by using the automatic CST (Concrete Syntax Tree) output capabilities
     * of chevrotain.
     *
     * See farther details here:
     * https://github.com/SAP/chevrotain/blob/master/docs/concrete_syntax_tree.md
     */
  
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
  const Dot = createToken({ name: "Dot", pattern: /\./ })
  const And = createToken({ name: "And", pattern: /and/ })
  const Or = createToken({ name: "Or", pattern: /or/ })
  const Equals = createToken({ name: "Equals", pattern: /=/ })
  const NotEquals = createToken({ name: "NotEquals", pattern: /!=/ })
  const LessThan = createToken({ name: "LessThan", pattern: /</ })
  const GreaterThan = createToken({ name: "GreaterThan", pattern: />/ })
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
  
      $.RULE("start", () => {
        $.MANY(() => {
          $.SUBRULE($.expression)
        })
      })
  
      $.RULE("expression", () => {
        $.OR([
          { ALT: () => $.SUBRULE($.logical) }
        ])
      })
  
      $.RULE("logical", () => {
        $.CONSUME(ID)
        $.MANY(() => {
          $.OR([
            { ALT: () => $.CONSUME(And) }, 
            { ALT: () => $.CONSUME(Or) }
          ])
          $.SUBRULE2($.expression)
        })
      })
  
      $.RULE("comparison", () => {
        $.CONSUME(ID)
        $.MANY(() => {
          $.OR([
            { ALT: () => $.CONSUME(LessThan) }, 
            { ALT: () => $.CONSUME(GreaterThan) },
            { ALT: () => $.CONSUME(Equals) },
            { ALT: () => $.CONSUME(NotEquals) }
          ])
          $.SUBRULE2($.expression)
        })
      })
  
      $.RULE("math", () => {
        $.CONSUME(ID)
        $.MANY(() => {
          $.OR([
            { ALT: () => $.CONSUME(Plus) }, 
            { ALT: () => $.CONSUME(Minus) },
            { ALT: () => $.CONSUME(Mul) },
            { ALT: () => $.CONSUME(Div) }
          ])
          $.SUBRULE2($.expression)
        })
      })
  
      $.RULE("accessor", () => {
        $.CONSUME(ID)
        $.CONSUME(Dot)
        $.SUBRULE($.expression)
      })
  
      // $.RULE("groupExpression", () => {
      //   $.CONSUME(LParen)
      //   $.SUBRULE($.expression)
      //   $.CONSUME(RParen)
      // })
  
      // very important to call this after all the rules have been defined.
      // otherwise the parser may not work correctly as it will lack information
      // derived during the self analysis phase.
      this.performSelfAnalysis()
    }
  }
  
  // ----------------- wrapping it all together -----------------
  
  // reuse the same parser instance.
  const parser = new TinyCParser()
  
    return {
        lexer: TinyCLexer,
        parser: TinyCParser,
        defaultRule: 'start'
    }
    
    
  }())