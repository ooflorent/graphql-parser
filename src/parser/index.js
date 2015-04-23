import filter from 'lodash/collection/filter'
import isPlainObject from 'lodash/lang/isPlainObject'
import Transformer, {simple, subtree} from 'parsly/transformer'
import graphql from './graphql'
import * as t from '../types'

const filterOrNull = (arr, fn) => {
  arr = filter(arr, fn)
  return arr.length > 0 ? arr : null
}

const transformer = new Transformer()
  // Root nodes
  .rule({id: simple, args: subtree, fields: subtree}, ({id, args, fields}) => t.query(id, args, filterOrNull(fields, t.isField), filterOrNull(fields, t.isReference)))
  .rule({type: simple, fields: subtree}, ({type, fields}) => t.fragment(type, filterOrNull(fields, t.isField), filterOrNull(fields, t.isReference)))
  // Fields
  .rule({id: simple, args: subtree}, ({id, args}) => t.call(id, args))
  .rule({id: simple}, ({id, fields, calls}) => t.field(id, filterOrNull(fields, t.isField), filterOrNull(fields, t.isReference), calls))
  // Arguments
  .rule({ref: simple}, ({ref}) => t.reference(parseInt(ref, 10)))
  .rule({variable: simple}, ({variable}) => t.identifier(variable))
  .rule({value: subtree}, ({value}) => t.literal(JSON.parse(value), value))
  // Error
  .rule(isPlainObject, (node) => { throw new Error(`Unexpected node ${JSON.stringify(node)}`) })

/**
 * Parses the given GraphQL query and returns its resulting AST.
 */
export default function parse(source) {
  const ast = graphql.parse(String(source))
  return transformer.run(ast)
}
