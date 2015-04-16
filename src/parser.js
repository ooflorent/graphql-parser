import {alt, custom, lazy, match, seq, str} from 'parsly/parser'

function isWhitespace(ch) {
  return ch === 32 || ch >= 9 && ch <= 13
}

function isIdentifierStart(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122
}

function isIdentifierChar(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57
}

// Custom parsers & helpers
// ------------------------

/**
 * Matches whitespaces.
 */
const ws = custom((resolve, reject) => (stream, index) => {
  while (isWhitespace(stream.charCodeAt(index))) {
    index++
  }

  return resolve(index)
})

/**
 * Creates a new parser that skips whitespaces before parsing the token.
 */
const lex = (atom) => custom((resolve, reject) => (stream, index) => {
  const result = ws.run(stream, index)
  return atom.run(stream, result.index).aggregate(result)
})

/**
 * Matches identifiers.
 * The implementation does not handle astal range.
 */
const ident = lex(custom((resolve, reject) => (stream, index) => {
  if (isIdentifierStart(stream.charCodeAt(index))) {
    const start = index
    while (isIdentifierChar(stream.charCodeAt(index))) {
      index++
    }

    return resolve(index, stream.slice(start, index))
  }

  return reject(index, 'Expected valid identifier')
}))

/**
 * Creates a parser that match `glue` separated tokens.
 * The implementation is not fully compliant with JS calls.
 *
 *    ()          // ok
 *    (a, b, c)   // ok
 *    (a, b, c,)  // inconsistency
 *    (a b c)     // inconsistency
 */
const sep = (atom, glue) => seq(atom, glue.maybe()).many()

// Punctuations
// ------------

const braceL = lex(str('{'))
const braceR = lex(str('}'))
const parenL = lex(str('('))
const parenR = lex(str(')'))
const angleL = lex(str('<'))
const angleR = lex(str('>'))
const period = lex(str('.'))
const comma = lex(str(','))
const amp = lex(str('&'))

// Naive JSON parser
// -----------------

const number = match(/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
const string = seq(str('"'), match(/[^"]+/), str('"'))
const array = lazy(() => seq(str('['), alt(array, match(/[^\[\]]+/)).many(), str(']')))
const object = lazy(() => seq(str('{'), alt(object, match(/[^\{\}]+/)).many(), str('}')))
const keywords = alt(str('null'), str('true'), str('false'))

export const json = lex(alt(keywords, number, string, array, object))

// Primitive types
// ---------------

export const identifier = ident.as('identifier')
export const variable = seq(angleL, ident.as('variable'), angleR)
export const ref = seq(amp, ident.as('ref'))

export const arg = alt(variable, json.as('json'))
export const call = seq(identifier, parenL, sep(arg, comma).as('args'), parenR)
export const calls = seq(period, call).repeat(1).as('calls')

export const field = lazy(() => seq(identifier, calls.maybe(), fields.maybe()))
export const fields = seq(braceL, sep(alt(field, ref), comma), braceR).as('fields')

export const query = seq(call, fields)
export const fragment = seq(ident.as('type'), fields)

export const node = alt(query, fragment)
export const root = node.many().as('nodes')
