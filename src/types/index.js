import each from 'lodash/collection/each'

import BUILDER_KEYS from './builder_keys'
import VISITOR_KEYS from './visitor_keys'

export { BUILDER_KEYS, VISITOR_KEYS }

function lcfirst(string) {
  return string[0].toLowerCase() + string.slice(1)
}

function shallowEqual(actual, expected) {
  for (let key in expected) {
    if (actual[key] !== expected[key]) {
      return false
    }
  }

  return true
}

export function is(type, node, opts) {
  if (!node) return false
  if (node.type !== type) return false

  if (opts) {
    return shallowEqual(node, opts)
  }

  return true
}

each(BUILDER_KEYS, (keys, type) => {
  exports[lcfirst(type)] = (...args) => {
    const node = { type }
    let i = 0

    for (let key in keys) {
      node[key] = args[i] !== undefined ? args[i] : keys[key]
      i++
    }

    return node
  }
})

each(VISITOR_KEYS, (keys, type) => {
  exports[`is${type}`] = (node, opts) => is(type, node, opts)
  exports[`assert${type}`] = (node, opts = {}) => {
    if (!is(type, node, opts)) {
      throw new Error(`Expected type ${JSON.stringify(type)} with options ${JSON.stringify(opts)}`)
    }
  }
})
