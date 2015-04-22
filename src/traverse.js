import isPlainObject from 'lodash/lang/isPlainObject'
import * as t from './types'

export default function traverse(node, opts, state) {
  if (Array.isArray(node)) {
    return node.map((child) => traverse.node(child, opts, state))
  }

  if (!isPlainObject(node)) {
    return node
  }

  return traverse.node(node, opts, state)
}

traverse.node = function(node, opts, state) {
  const keys = t.VISITOR_KEYS[node.type]
  if (!keys) return node

  let replacement = call('enter', node, opts, state)
  if (replacement !== node) return replacement

  for (let i = 0; i < keys.length; i++) {
    node[keys[i]] = traverse(node[keys[i]], opts, state)
  }

  replacement = call('exit', node, opts, state)
  if (replacement !== node) return replacement

  return node
}

function call(event, node, opts, state) {
  opts = opts[node.type] || opts

  const visitor = opts[event]
  const replacement = visitor(node, state)

  return replacement
}
