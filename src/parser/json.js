import {alt, lazy, match, seq, str} from 'parsly/parser'
import {ident, lex} from './util'

const number = match(/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
const string = seq(str('"'), match(/[^"]+/), str('"'))
const array = lazy(() => seq(str('['), alt(array, match(/[^\[\]]+/)).many(), str(']')))
const object = lazy(() => seq(str('{'), alt(object, match(/[^\{\}]+/)).many(), str('}')))
const keywords = alt(str('null'), str('true'), str('false'))
const value = lex(alt(keywords, number, string, array, object))

export default value
