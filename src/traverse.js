export default function traverse(node, visitor, parent) {
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
    node = visitor[type](node, parent)
  }

  return node
}
