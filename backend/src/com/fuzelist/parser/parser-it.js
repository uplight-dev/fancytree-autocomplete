const suggestions = require("./parserSuggestions")

var symbols = () => ["Immo", "Appartment"];

s = suggestions.getSuggestions('Immo.App > 5', symbols);
console.log(JSON.stringify(s,null, 2))