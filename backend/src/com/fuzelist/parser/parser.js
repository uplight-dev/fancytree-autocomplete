const chevrotain = require("chevrotain")
const FLParser = require("./parser0")(chevrotain)

module.exports = {
    lexer: FLParser.lexer,
    Parser: FLParser.parser,
    ID: FLParser.ID
}