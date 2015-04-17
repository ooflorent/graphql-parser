import VISITOR_KEYS from './visitor_keys'

const identity = (x) => x

export default function traverse(node, visitors = {}) {
  if (!node) return

  if (Array.isArray(node)) {
    node = node.map((node) => traverse.node(node, visitors))
  } else {
    node = traverse.node(node, visitors)
  }

  return node
}

traverse.node = function(node, visitors) {
  const type = node.type
  const keys = VISITOR_KEYS[type]
  if (!keys) return node

  const visitor = visitors[type] || {}
  if (visitor.enter) {
    node = visitor.enter(node)
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    node[key] = traverse(node[key], visitors)
  }

  if (visitor.exit) {
    node = visitor.exit(node)
  }

  return node
}
