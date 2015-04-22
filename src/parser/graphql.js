import {alt, lazy, match, seq, str} from 'parsly/parser'
import {ident, lex, sep} from './util'
import json from './json'

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

// Primitive types
// ---------------

const literal = json.as('value')
const identifier = ident.as('id')
const variable = seq(angleL, ident.as('variable'), angleR)
const uint = match(/(?:0|[1-9]\d*)/)
const ref = seq(amp, uint.as('ref'))

// Rules
// -----

const arg = alt(variable, ref, literal)
const call = seq(identifier, parenL, sep(arg, comma).as('args'), parenR)
const calls = seq(period, call).repeat(1).as('calls')

const field = lazy(() => seq(identifier, calls.maybe(), fields.maybe()))
const fields = seq(braceL, sep(alt(field, ref), comma), braceR).as('fields')

const query = seq(call, fields)
const fragment = seq(ident.as('type'), fields)
const node = alt(query, fragment)

export default node
