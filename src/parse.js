import Parser from './parser'

export default function parse(source) {
  const parser = new Parser(source)
  return parser.parseQuery()
}
