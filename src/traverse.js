export default function traverse(node, visitor, parent) {
  if (!node) {
    return node
  }

  const type = node.type
  switch (type) {
    case 'Query':
      node.fields = node.fields.map((n) => traverse(n, visitor, node))
      break

    case 'Field':
      node.params = node.params.map((n) => traverse(n, visitor, node))
      node.fields = node.fields.map((n) => traverse(n, visitor, node))
      break

    case 'Argument':
      node.value = traverse(node.value, visitor, node)
      break
  }

  if (typeof visitor[type] === 'function') {
    const repl = visitor[type](node, parent)
    if (repl !== void 0) {
      node = repl
    }
  }

  return node
}
