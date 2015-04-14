import {alt, custom, lazy, seq, str} from 'parsly'

function isWhitespace(ch) {
  return ch === 32 || ch >= 9 && ch <= 13
}

function isIdentifierStart(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122
}

function isIdentifierChar(ch) {
  return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57
}

const ws = custom((resolve, reject) => (stream, index) => {
  while (isWhitespace(stream.charCodeAt(index))) {
    index++
  }

  return resolve(index)
})

const ident = custom((resolve, reject) => (stream, index) => {
  if (isIdentifierStart(stream.charCodeAt(index))) {
    const start = index
    while (isIdentifierChar(stream.charCodeAt(index))) {
      index++
    }

    return resolve(index, stream.slice(start, index))
  }

  return reject(index, 'Expected valid identifier')
})

const lex = (atom) => custom((resolve, reject) => (stream, index) => {
  const result = ws.run(stream, index)
  return atom.run(stream, result.index).aggregate(result)
})

const sep = (atom, glue) => seq(atom, glue.maybe()).many()

const braceL = lex(str('{'))
const braceR = lex(str('}'))
const parenL = lex(str('('))
const parenR = lex(str(')'))
const angleL = lex(str('<'))
const angleR = lex(str('>'))
const period = lex(str('.'))
const comma = lex(str(','))

export const identifier = lex(ident).as('identifier')
export const variable = seq(angleL, lex(ident).as('variable'), angleR)

export const arg = alt(variable, identifier)
export const call = seq(identifier, parenL, sep(arg, comma).as('args'), parenR)
export const calls = seq(period, call).many().as('calls')

export const field = lazy(() => seq(identifier, calls.maybe(), fields.maybe()))
export const fields = seq(braceL, sep(field, comma), braceR).as('fields')

export const query = seq(call, fields)
export const fragment = seq(identifier, fields)

export const node = alt(query, fragment)
