/*
http://sap.github.io/chevrotain/playground/?example=JSON%20grammar%20only
(Immo.loc ~ [WSL,WSP] or Immo.loc = Etterbeek) and (Immo.date > #now)

https://github.com/SAP/chevrotain/issues/807
https://github.com/SAP/chevrotain/blob/0a2caa4b440b6ee239f2500b51c010cdb98faf55/examples/grammars/ecma5/ecma5_parser.js#L258-L285
https://www.ecma-international.org/ecma-262/5.1/index.html#sec-11.1.4
https://github.com/SAP/chevrotain/blob/0a2caa4b440b6ee239f2500b51c010cdb98faf55/examples/grammars/ecma5/ecma5_tokens.js
https://github.com/SAP/chevrotain/blob/0a2caa4b440b6ee239f2500b51c010cdb98faf55/examples/grammars/ecma5/ecma5_lexer.js
https://github.com/acornjs/acorn/blob/master/acorn/src/tokentype.js
https://sap.github.io/chevrotain/documentation/7_0_1/interfaces/tokentype.html
https://github.com/SAP/chevrotain/blob/711f8692/packages/chevrotain/api.d.ts#L1633
*/

const FLParser = function(chevrotain) {
  
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
  const LBracket = createToken({ name: "LBracket", pattern: /\[/ })
  const RBracket = createToken({ name: "RBracket", pattern: /\]/ })
  const SemiColon = createToken({ name: "SemiColon", pattern: /;/ })
  const Comma = createToken({ name: "Comma", pattern: /,/ })
  const Diez = createToken({ name: "Diez", pattern: /#/ })
  const Dot = createToken({ name: "Dot", pattern: /\./ })
  const And = createToken({ name: "And", pattern: /and/ })
  const Or = createToken({ name: "Or", pattern: /or/ })
  const Equals = createToken({ name: "Equals", pattern: /=/ })
  const Tilde = createToken({ name: "Tilde", pattern: /~/ })
  const NotEquals = createToken({ name: "NotEquals", pattern: /!=/ })
  const LessThan = createToken({ name: "LessThan", pattern: /</ })
  const GreaterThan = createToken({ name: "GreaterThan", pattern: />/ })
  const Plus = createToken({ name: "Plus", pattern: /\+/ })
  const Minus = createToken({ name: "Minus", pattern: /-/ })
  const Mul = createToken({ name: "Mul", pattern: /\*/ })
  const Div = createToken({ name: "Div", pattern: /\// })
  const INT = createToken({ name: "Int", pattern: /[+-]?(([1-9](_\d|\d)*)|0)/, label: "Integer" })
  // TODO: resolve ambiguity keywords vs identifiers
  const ID = createToken({ name: "ID", pattern: /[A-Za-z0-9_-]+/, label: "ID" })
  const FnID = createToken({ name: "FnID", pattern: /#[A-Za-z0-9_-]+/, label: "FN" })
  
  const flLexer = new Lexer(allTokens)
  
  // ----------------- parser -----------------
  
  class FLParser extends CstParser {
    // Unfortunately no support for class fields with initializer in ES2015, only in esNext...
    // so the parsing rules are defined inside the constructor, as each parsing rule must be initialized by
    // invoking RULE(...)
    // see: https://github.com/jeffmo/es-class-fields-and-static-properties
    constructor() {
      super(allTokens)
  
      const $ = this
  
      $.RULE("start", () => {
        $.MANY(() => {
          $.SUBRULE($.expression)
        })
      })
  
      $.RULE("expression", () => {
        $.OR([
          //{ ALT: () => $.SUBRULE($.arrayBinary) },
          { ALT: () => $.SUBRULE($.binary) }
        ])
      })
  
      $.RULE("binary", () => {
        $.SUBRULE($.term)
        $.MANY(() => {
          $.OR([
            { ALT: () => $.CONSUME(And)},
            { ALT: () => $.CONSUME(Or)},
            { ALT: () => $.CONSUME(LessThan) }, 
            { ALT: () => $.CONSUME(GreaterThan) },
            { ALT: () => $.CONSUME(Equals) },
            { ALT: () => $.CONSUME(NotEquals) },
            { ALT: () => $.CONSUME(Plus) }, 
            { ALT: () => $.CONSUME(Minus) },
            { ALT: () => $.CONSUME(Mul) }, 
            { ALT: () => $.CONSUME(Div) },
            { ALT: () => $.CONSUME(Tilde) }
          ])
          $.SUBRULE2($.term)
        });
      })
  
      $.RULE("term", () => {
        $.OR([
          { ALT: () => $.SUBRULE($.group) },
          { ALT: () => $.SUBRULE($.property) },
          { ALT: () => $.SUBRULE($.array) },
          { ALT: () => $.SUBRULE($.fn) },
          { ALT: () => $.CONSUME(INT) },
        ])
      })
      
      $.RULE("property", () => {
        $.CONSUME(ID)
        $.MANY(() => {
        	$.CONSUME(Dot)
        	$.SUBRULE($.property)
        })
      })
      
      $.RULE("arrayBinary", () => {
        $.SUBRULE($.property)
        $.CONSUME(Tilde)
        $.SUBRULE2($.array)
      })
      
      $.RULE("array", () => {
        $.CONSUME(LBracket)
        $.CONSUME(ID)
        $.MANY(() => {
          $.SUBRULE($.elision)
          $.CONSUME2(ID)
        })
        $.CONSUME(RBracket)
      })
  
      $.RULE("group", () => {
        $.CONSUME(LParen)
        $.SUBRULE($.expression)
        $.CONSUME(RParen)
      })
      
      $.RULE("fn", () => {
        $.CONSUME(FnID)
      })
      
      $.RULE("elision", () => {
        $.CONSUME(Comma)
      })
  
      // very important to call this after all the rules have been defined.
      // otherwise the parser may not work correctly as it will lack information
      // derived during the self analysis phase.
      this.performSelfAnalysis()
    }
  }
  
  // ----------------- wrapping it all together -----------------
  
  return {
      lexer: flLexer,
      parser: FLParser,
      defaultRule: 'start',
      ID: ID
  }
    
    
}


//FLParser(chevrotain)  


//don't paste this to http://sap.github.io/chevrotain/playground/
module.exports = FLParser
  
  
  
  