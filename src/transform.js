import Transform, {Node, simple, sequence, subtree} from 'parsly/transform'

const transform = new Transform([
  [
    (node) => sequence(node.nodes),
    (node) => node.nodes
  ],
  [
    (node) => simple(node.type) && subtree(node.fields),
    (node) => new Node({type: 'Fragment', name: node.type, fields: node.fields}),
  ],
  [
    (node) => simple(node.identifier) && sequence(node.args) && subtree(node.fields),
    (node) => new Node({type: 'Query', name: node.identifier, arguments: node.args, fields: node.fields}),
  ],
  [
    (node) => simple(node.identifier) && sequence(node.args),
    (node) => new Node({type: 'Call', name: node.identifier, arguments: node.args})
  ],
  [
    (node) => simple(node.identifier),
    (node) => new Node({type: 'Field', name: node.identifier, calls: node.calls, fields: node.fields})
  ],
  [
    (node) => simple(node.variable),
    (node) => new Node({type: 'Identifier', name: node.variable})
  ],
  [
    (node) => simple(node.ref),
    (node) => new Node({type: 'FragmentIdentifier', name: node.ref}),
  ],
  [
    (node) => simple(node.json),
    (node) => new Node({type: 'Literal', value: node.json}),
  ],
])

export default (ast) => transform.run(ast)
