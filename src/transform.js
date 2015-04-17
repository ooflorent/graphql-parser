import Transform, {Node, simple, sequence, subtree} from 'parsly/transform'

const isFragment = (node) => node.type === 'Fragment' || node.type === 'FragmentIdentifier'
const isField = (node) => !isFragment(node)

const fragments = (nodes) => Array.isArray(nodes) ? nodes.filter(isFragment) : []
const fields = (nodes) => Array.isArray(nodes) ? nodes.filter(isField) : []

const transform = new Transform([
  [
    (node) => sequence(node.nodes),
    (node) => node.nodes
  ],
  [
    (node) => simple(node.type) && sequence(node.fields),
    (node) => new Node({type: 'Fragment', name: node.type, fields: fields(node.fields), fragments: fragments(node.fields)}),
  ],
  [
    (node) => simple(node.identifier) && sequence(node.args) && sequence(node.fields),
    (node) => new Node({type: 'Query', name: node.identifier, arguments: node.args, fields: fields(node.fields), fragments: fragments(node.fields)}),
  ],
  [
    (node) => simple(node.identifier) && sequence(node.args),
    (node) => new Node({type: 'Call', name: node.identifier, arguments: node.args})
  ],
  [
    (node) => simple(node.identifier),
    (node) => new Node({type: 'Field', name: node.identifier, calls: node.calls, fields: fields(node.fields), fragments: fragments(node.fields)})
  ],
  [
    (node) => simple(node.ref),
    (node) => new Node({type: 'FragmentIdentifier', name: node.ref}),
  ],
  [
    (node) => simple(node.variable),
    (node) => new Node({type: 'Identifier', name: node.variable})
  ],
  [
    (node) => simple(node.json),
    (node) => new Node({type: 'Literal', value: JSON.parse(node.json)}),
  ],
])

export default (ast) => transform.run(ast)
