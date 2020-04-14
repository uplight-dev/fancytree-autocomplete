const nearley = require("nearley");
const grammar = require("./grammar.js");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Parse something!
parser.feed("( Immo.owner.name == \"John\" ) and ( Immo.type == \"app\" ) or ( Immo.price >= 250000 )");

// parser.results is an array of possible parsings.
console.log("found results: " + parser.results.length)
console.log(JSON.stringify(parser.results[0])); // [[[[ "foo" ],"\n" ]]]