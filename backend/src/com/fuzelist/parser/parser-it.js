const suggestions = require("./parserSuggestions")

var symbols = () => ["Immo", "Appartment"];

s = suggestions.getSuggestions('(Immo.loc ~ [WSL]) and (', symbols);
console.log(JSON.stringify(s,null, 2))