const suggestions = require("./parserSuggestions")

s = suggestions.getSuggestions('{i=5;if (i<10) { while (x');
console.log(JSON.stringify(s,null, 2))