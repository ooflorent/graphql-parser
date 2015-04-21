import parse from './parser'
import transform from './transform'

export * as GraphQL from './types'
export { parse, transform }

export default function graphql(strings, ...args) {
  let source = strings[0] || ''
  for (let i = 1; i < strings.length; i++) {
    source += `&${ i - 1 }`
    source += strings[i]
  }

  const ast = parse(source)
  return (params) => {
    return transform(ast, { args, params })
  }
}
