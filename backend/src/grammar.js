// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
    ws: /[ \t]+/,
    nl: { match: "\n", lineBreaks: true },
    lte: "<=",
    lt: "<",
    gte: ">=",
    gt: ">",
    eq: "==",
    lparan: "(",
    rparan: ")",
    comma: ",",
    lbracket: "[",
    rbracket: "]",
    lbrace: "{",
    rbrace: "}",
    plus: "+",
    minus: "-",
    multiply: "*",
    divide: "/",
    colon: ":",
    dot: ".",
    string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
        value: s => JSON.parse(s)
    },
    number_literal: {
        match: /[0-9]+(?:\.[0-9]+)?/,
        value: s => Number(s)
    },
    identifier: {
        match: /[A-Z_][a-z_0-9]*/,
        type: moo.keywords({
            and: "and",
            or: "or",
            true: "true",
            false: "false"
        })
    },
    prop: {
        match: /[a-z_][a-z_0-9]*/,
        type: moo.keywords({
            and: "and",
            or: "or",
            true: "true",
            false: "false"
        })
    }
});


function tokenStart(token) {
    return {
        line: token.line,
        col: token.col - 1
    };
}

function tokenEnd(token) {
    const lastNewLine = token.text.lastIndexOf("\n");
    if (lastNewLine !== -1) {
        throw new Error("Unsupported case: token with line breaks");
    }
    return {
        line: token.line,
        col: token.col + token.text.length - 1
    };
}

function convertToken(token) {
    return {
        type: token.type,
        value: token.value
    };
}

function convertTokenId(data) {
    return convertToken(data[0]);
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "input", "symbols": ["top_level_statements"], "postprocess": id},
    {"name": "top_level_statements", "symbols": ["top_level_statement"], "postprocess": 
        d => [d[0]]
                },
    {"name": "top_level_statements", "symbols": ["top_level_statement", "_", {"literal":"\n"}, "_", "top_level_statements"], "postprocess": 
        d => [
            d[0],
            ...d[4]
        ]
                },
    {"name": "top_level_statements", "symbols": ["_", {"literal":"\n"}, "top_level_statements"], "postprocess": 
        d => d[2]
                },
    {"name": "top_level_statements", "symbols": ["_"], "postprocess": 
        d => []
                },
    {"name": "top_level_statement", "symbols": ["expression"]},
    {"name": "expression", "symbols": ["boolean_expression"], "postprocess": id},
    {"name": "expression", "symbols": ["comparison_expression"], "postprocess": id},
    {"name": "expression", "symbols": ["grouping_expr"], "postprocess": id},
    {"name": "expression", "symbols": ["assignment"], "postprocess": id},
    {"name": "expression", "symbols": ["unary_expression"], "postprocess": id},
    {"name": "grouping_expr", "symbols": ["_", (lexer.has("lparan") ? {type: "lparan"} : lparan), "_", "expression", "_", (lexer.has("rparan") ? {type: "rparan"} : rparan), "_"], "postprocess": d => ({type: "grouping_expr", expr: d[3]})},
    {"name": "proppath_access", "symbols": ["id_prop"]},
    {"name": "id_prop", "symbols": ["identifier", (lexer.has("dot") ? {type: "dot"} : dot), "prop_chain"], "postprocess": 
        d => ({
            type: "prop_path",
            obj: d[0],
            props: d[2]
        })
            },
    {"name": "prop_chain", "symbols": [(lexer.has("prop") ? {type: "prop"} : prop), (lexer.has("dot") ? {type: "dot"} : dot), "prop_chain"], "postprocess": 
        d => [d[0], d[2]]
            },
    {"name": "prop_chain", "symbols": [(lexer.has("prop") ? {type: "prop"} : prop)], "postprocess": id},
    {"name": "indexed_access", "symbols": ["unary_expression", "_", {"literal":"["}, "_", "expression", "_", {"literal":"]"}], "postprocess": 
        d => ({
            type: "indexed_access",
            subject: d[0],
            index: d[4]
        })
                },
    {"name": "boolean_expression", "symbols": ["expression", "_", "boolean_operator", "_", "expression"], "postprocess": 
        d => ({
            type: "binary_operation",
            operator: convertToken(d[2]),
            left: d[0],
            right: d[4]
        })
                },
    {"name": "boolean_operator", "symbols": [{"literal":"and"}], "postprocess": id},
    {"name": "boolean_operator", "symbols": [{"literal":"or"}], "postprocess": id},
    {"name": "comparison_expression", "symbols": ["expression", "_", "comparison_operator", "_", "expression"], "postprocess": 
        d => ({
            type: "binary_operation",
            operator: d[2],
            left: d[0],
            right: d[4]
        })
                },
    {"name": "comparison_operator", "symbols": [{"literal":">"}], "postprocess": convertTokenId},
    {"name": "comparison_operator", "symbols": [{"literal":">="}], "postprocess": convertTokenId},
    {"name": "comparison_operator", "symbols": [{"literal":"<"}], "postprocess": convertTokenId},
    {"name": "comparison_operator", "symbols": [{"literal":"<="}], "postprocess": convertTokenId},
    {"name": "comparison_operator", "symbols": [{"literal":"=="}], "postprocess": convertTokenId},
    {"name": "additive_expression", "symbols": ["expression", "_", /[+-]/, "_", "expression"], "postprocess": 
        d => ({
            type: "binary_operation",
            operator: convertToken(d[2]),
            left: d[0],
            right: d[4]
        })
                },
    {"name": "multiplicative_expression", "symbols": ["expression", "_", /[*/%]/, "_", "expression"], "postprocess": 
        d => ({
            type: "binary_operation",
            operator: convertToken(d[2]),
            left: d[0],
            right: d[4]
        })
                },
    {"name": "unary_expression", "symbols": ["number"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["identifier"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["string_literal"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["list_literal"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["dictionary_literal"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["boolean_literal"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["indexed_access"], "postprocess": id},
    {"name": "unary_expression", "symbols": ["proppath_access"], "postprocess": id},
    {"name": "list_literal", "symbols": [{"literal":"["}, "list_items", {"literal":"]"}], "postprocess": 
        d => ({
            type: "list_literal",
            items: d[1]
        })
                },
    {"name": "list_items", "symbols": [], "postprocess": () => []},
    {"name": "list_items", "symbols": ["_ml", "expression", "_ml"], "postprocess": d => [d[1]]},
    {"name": "list_items", "symbols": ["_ml", "expression", "_ml", {"literal":","}, "list_items"], "postprocess": 
        d => [
            d[1],
            ...d[4]
        ]
                },
    {"name": "dictionary_literal", "symbols": [{"literal":"{"}, "dictionary_entries", {"literal":"}"}], "postprocess": 
        d => ({
            type: "dictionary_literal",
            entries: d[1]
        })
                },
    {"name": "dictionary_entries", "symbols": [], "postprocess": () => []},
    {"name": "dictionary_entries", "symbols": ["_ml", "dictionary_entry", "_ml"], "postprocess": 
        d => [d[1]]
                },
    {"name": "dictionary_entries", "symbols": ["_ml", "dictionary_entry", "_ml", {"literal":","}, "dictionary_entries"], "postprocess": 
        d => [d[1], ...d[4]]
                },
    {"name": "dictionary_entry", "symbols": ["identifier", "_ml", {"literal":":"}, "_ml", "expression"], "postprocess": 
        d => [d[0], d[4]]
                },
    {"name": "assignment", "symbols": ["identifier", "_", (lexer.has("assignment") ? {type: "assignment"} : assignment), "_", "expression"], "postprocess": 
        d => ({
            type: "assignment",
            id: d[0],
            value: d[4]
        })
                },
    {"name": "boolean_literal", "symbols": [{"literal":"true"}], "postprocess": 
        d => ({
            type: "boolean_literal",
            value: true
        })
                },
    {"name": "boolean_literal", "symbols": [{"literal":"false"}], "postprocess": 
        d => ({
            type: "boolean_literal",
            value: false
        })
                },
    {"name": "string_literal", "symbols": [(lexer.has("string_literal") ? {type: "string_literal"} : string_literal)], "postprocess": convertTokenId},
    {"name": "number", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)], "postprocess": convertTokenId},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": convertTokenId},
    {"name": "_ml$ebnf$1", "symbols": []},
    {"name": "_ml$ebnf$1", "symbols": ["_ml$ebnf$1", "multi_line_ws_char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_ml", "symbols": ["_ml$ebnf$1"]},
    {"name": "multi_line_ws_char", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "multi_line_ws_char", "symbols": [{"literal":"\n"}]},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "input"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
