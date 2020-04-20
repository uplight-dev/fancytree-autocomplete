@{%
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

%}

@lexer lexer

input -> top_level_statements {% id %}

top_level_statements
    ->  top_level_statement
        {%
            d => [d[0]]
        %}
    |  top_level_statement _ "\n" _ top_level_statements
        {%
            d => [
                d[0],
                ...d[4]
            ]
        %}
    # below 2 sub-rules handle blank lines
    |  _ "\n" top_level_statements
        {%
            d => d[2]
        %}
    |  _
        {%
            d => []
        %}

top_level_statement -> expression

expression 
    -> boolean_expression         {% id %}
    | comparison_expression       {% id %}
    | grouping_expr               {% id %}
    | assignment                  {% id %}
    | unary_expression            {% id %}

grouping_expr
    -> _ %lparan _ expression _ %rparan _ {% d => ({type: "grouping_expr", expr: d[3]}) %}

proppath_access -> id_prop

id_prop
    -> identifier %dot prop_chain
    {%
        d => ({
            type: "prop_path",
            obj: d[0],
            props: d[2]
        })
    %}

prop_chain
    -> %prop %dot prop_chain
    {%
        d => [d[0], d[2]]
    %}
    | %prop {% id %}

indexed_access
    -> unary_expression _ "[" _ expression _ "]"
        {%
            d => ({
                type: "indexed_access",
                subject: d[0],
                index: d[4]
            })
        %}

boolean_expression
    ->  expression _ boolean_operator _ identifier
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4]
            })
        %}

boolean_operator
    -> "and"      {% id %}
    |  "or"       {% id %}

comparison_expression
    ->  expression _ comparison_operator _ expression
        {%
            d => ({
                type: "binary_operation",
                operator: d[2],
                left: d[0],
                right: d[4]
            })
        %}

comparison_operator
    -> ">"   {% convertTokenId %}
    |  ">="  {% convertTokenId %}
    |  "<"   {% convertTokenId %}
    |  "<="  {% convertTokenId %}
    |  "=="  {% convertTokenId %}

additive_expression
    ->  expression _ [+-] _ expression
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4]
            })
        %}

multiplicative_expression
    ->  expression _ [*/%] _ expression
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4]
            })
        %}

unary_expression
    -> number               {% id %}
    |  identifier           {% id %}
    |  string_literal       {% id %}
    |  list_literal         {% id %}
    |  dictionary_literal   {% id %}
    |  boolean_literal      {% id %}
    |  indexed_access       {% id %}
    |  proppath_access      {% id %}

list_literal
    -> "[" list_items "]"
        {%
            d => ({
                type: "list_literal",
                items: d[1]
            })
        %}

list_items
    -> null
        {% () => [] %}
    |  _ml expression _ml
        {% d => [d[1]] %}
    |  _ml expression _ml "," list_items
        {%
            d => [
                d[1],
                ...d[4]
            ]
        %}

dictionary_literal
    -> "{" dictionary_entries "}"
        {%
            d => ({
                type: "dictionary_literal",
                entries: d[1]
            })
        %}

dictionary_entries
    -> null  {% () => [] %}
    |  _ml dictionary_entry _ml
        {%
            d => [d[1]]
        %}
    |  _ml dictionary_entry _ml "," dictionary_entries
        {%
            d => [d[1], ...d[4]]
        %}

dictionary_entry
    -> identifier _ml ":" _ml expression
        {%
            d => [d[0], d[4]]
        %}

assignment
    -> identifier _ %assignment _ expression
        {%
            d => ({
                type: "assignment",
                id: d[0],
                value: d[4]
            })
        %}

boolean_literal
    -> "true"
        {%
            d => ({
                type: "boolean_literal",
                value: true
            })
        %}
    |  "false"
        {%
            d => ({
                type: "boolean_literal",
                value: false
            })
        %}

string_literal -> %string_literal {% convertTokenId %}

number -> %number_literal {% convertTokenId %}

identifier -> %identifier {% convertTokenId %}

_ml -> multi_line_ws_char:*

multi_line_ws_char
    -> %ws
    |  "\n"

__ -> %ws:+

_ -> %ws:*