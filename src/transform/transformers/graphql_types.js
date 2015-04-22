import * as GraphQL from 'graphql-types'

export const Query = {
  exit(node) {
    return new GraphQL.Query(node.name, node.arguments, node.fields, node.fragments)
  }
}

export const Fragment = {
  exit(node) {
    return new GraphQL.Fragment(node.name, node.fields, node.fragments)
  }
}

export const Field = {
  exit(node) {
    return new GraphQL.Field(node.name, node.fields, node.fragments, node.calls)
  }
}

export const Call = {
  exit(node) {
    return new GraphQL.Call(node.callee, node.arguments)
  }
}

export const Identifier = {
  enter(node, state) {
    return state.variables[node.name]
  }
}

export const Reference = {
  enter(node, state) {
    return state.arguments[node.index]
  }
}

export const Literal = {
  enter(node) {
    return node.value
  }
}
