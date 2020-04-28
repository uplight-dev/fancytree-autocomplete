const suggestions = require("./parserSuggestions")

var symbols = ["Immo", "Appartment"];

s = suggestions.getSuggestions('Immo.', symbols);
console.log(JSON.stringify(s,null, 2))