import each from 'lodash/collection/each'
import assign from 'lodash/object/assign'
import identity from 'lodash/utility/identity'
import traverse from '../traverse'

function normalize(transformer) {
  transformer = assign({}, transformer)

  if (!transformer.enter) transformer.enter = identity
  if (!transformer.exit) transformer.exit = identity

  each(transformer, (opts, type) => {
    if (type[0] === '_') return

    if (!opts.enter) opts.enter = identity
    if (!opts.exit) opts.exit = identity
  })

  return transformer
}

export default class Transformer {
  constructor(transformer) {
    this.handlers = normalize(transformer)
  }

  run(ast, state) {
    return traverse(ast, this.handlers, state)
  }
}
