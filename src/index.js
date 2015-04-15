import {root} from './parser'

export default function parse(source) {
  return root(String(source)).parse()
}
