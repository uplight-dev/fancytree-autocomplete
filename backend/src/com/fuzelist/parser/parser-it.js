const suggestions = require("./parserSuggestions")

var symbols = ["Immo", "Appartment"];

s = suggestions.getSuggestions('Immo.Appa', symbols);
console.log(JSON.stringify(s,null, 2))