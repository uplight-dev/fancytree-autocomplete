const suggestions = require("./parserSuggestions")

var symbols = () => ["Immo", "Appartment"];

const input = '(Immo.loc ~ [WSL,WSP] or Immo.loc = Etterbeek) and (Immo.date > ';
s = suggestions.getSuggestions(input, symbols);
console.log(`${input}`)
console.log(JSON.stringify(s,null, 2))