import {root} from './parser'
import toAST from './transform'

export default function parse(source) {
  const nodes = root.parse(String(source))
  return toAST(nodes)
}
