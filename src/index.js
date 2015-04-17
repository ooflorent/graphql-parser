import {node} from './parser'
import transform from './transform'

export function parse(source) {
  return transform(node.parse(String(source)))
}

export traverse from './traverse'
