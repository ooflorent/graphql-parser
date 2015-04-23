import Transformer from './transformer'
import * as GraphQLTypes from './transformers/graphql_types'

const transformer = new Transformer(GraphQLTypes)

export default function transform(ast, state) {
  return transformer.run(ast, state)
}
