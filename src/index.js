import {node} from './parser'

export default function parse(source) {
  return node(String(source)).parse()
}
