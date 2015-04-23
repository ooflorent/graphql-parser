import {custom, seq} from 'parsly/parser'

function isWhitespace(ch) {
  return ch === 32 || ch >= 9 && ch <= 13
}

function isIdentifierStart(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122
}

function isIdentifierChar(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57
}

/**
 * Matches whitespaces.
 */
export const ws = custom((resolve, reject) => (stream, index) => {
  while (isWhitespace(stream.charCodeAt(index))) {
    index++
  }

  return resolve(index)
})

/**
 * Creates a new parser that skips whitespaces before parsing the token.
 */
export const lex = (atom) => custom((resolve, reject) => (stream, index) => {
  const result = ws.run(stream, index)
  return atom.run(stream, result.index).aggregate(result)
})

/**
 * Matches identifiers.
 * The implementation does not handle astal range.
 */
export const ident = lex(custom((resolve, reject) => (stream, index) => {
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
 */
export const sep = (atom, glue) => seq(seq(atom, glue).many(), atom).repeat(0, 1)
