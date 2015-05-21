import parse from './parse'
import traverse from './traverse'

function join(parts) {
  let result = parts[0] || ''
  for (let i = 1; i < parts.length; i++) {
    result += '&' + (i - 1) + parts[i]
  }

  return result
}

export default function graphql(strings, ...values) {
  const source = join(strings)
  const ast = parse(source)

  return (params) => traverse(ast, new TaggedTemplateVisitor(params, values))
}

const rootSymbol = '@@root'
const nameSymbol = '@@name'

class TaggedTemplateVisitor {
  constructor(params, quasis) {
    this.params = params
    this.quasis = quasis
  }

  transformFields(fields) {
    const obj = {}

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i]
      if (f.hasOwnProperty(rootSymbol)) {
        for (let field in f) {
          obj[field] = f[field]
        }
      } else {
        obj[f[nameSymbol]] = f
      }
    }

    return obj
  }

  Query(node) {
    const query = this.transformFields(node.fields)
    Object.defineProperty(query, rootSymbol, {value: true})

    return query
  }

  Field(node) {
    const field = {}
    Object.defineProperty(field, nameSymbol, {value: node.name})

    if (node.alias) {
      field.alias = node.alias
    }

    if (node.params.length > 0) {
      field.params = {}

      for (let i = 0; i < node.params.length; i++) {
        const arg = node.params[i]
        field.params[arg.name] = arg.value
      }
    }

    if (node.fields.length > 0) {
      field.fields = this.transformFields(node.fields)
    }

    return field
  }

  Literal(node) {
    return node.value
  }

  Reference(node) {
    return this.quasis[node.name]
  }

  Variable(node) {
    return this.params[node.name]
  }
}
