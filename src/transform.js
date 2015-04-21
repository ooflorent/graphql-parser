import Transform, {simple, sequence, subtree} from 'parsly/transform'
import * as GraphQL from './types'

const isField = (node) => node.constructor === GraphQL.Field
const isFragment = (node) => !isField(node)

const fields = (nodes) => Array.isArray(nodes) ? nodes.filter(isField) : []
const fragments = (nodes) => Array.isArray(nodes) ? nodes.filter(isFragment) : []

const transform = new Transform([
  [
    (node) => simple(node.type) && sequence(node.fields),
    (node) => new GraphQL.Fragment(node.type, fields(node.fields), fragments(node.fields)),
  ],
  [
    (node) => simple(node.identifier) && subtree(node.args) && sequence(node.fields),
    (node) => new GraphQL.Query(node.identifier, node.args, fields(node.fields), fragments(node.fields)),
  ],
  [
    (node) => simple(node.identifier) && subtree(node.args),
    (node) => new GraphQL.Call(node.identifier, node.args),
  ],
  [
    (node) => simple(node.identifier),
    (node) => new GraphQL.Field(node.identifier, fields(node.fields), fragments(node.fields), node.calls),
  ],
  [
    (node) => simple(node.ref),
    (node, context) => context.args[node.ref],
  ],
  [
    (node) => simple(node.variable),
    (node, context) => context.params[node.variable],
  ],
  [
    (node) => simple(node.json),
    (node) => JSON.parse(node.json),
  ],
])

export default (ast, context) => transform.run(ast, context)
