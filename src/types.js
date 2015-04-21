function pack(array) {
  let position = -1

  // Remove empty arrays
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i]) && array[i].length === 0) {
      array[i] = null
    }
  }

  // Trim `null`
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] != null) {
      position = i
      break
    }
  }

  array.length = position + 1
  return array
}

const NodeType = {
  QUERY: 1,
  FRAGMENT: 2,
  FIELD: 3,
  CALL: 4,
}

class Node {
  constructor(fields = [], fragments = []) {
    this.fields = fields
    this.fragments = fragments
  }

  static _getFields(nodes) {
    const fieldMap = {}

    for (let iterations = 0; nodes.length > 0; iterations++) {
      if (iterations++ > 1e4) {
        throw new Error('Endless loop')
      }

      const node = nodes.shift()


      // Process fragments
      nodes.push(...node.fragments)

      // Process fields
      for (let i = 0; i < node.fields.length; i++) {
        const field = node.fields[i]
        const name = field.name
        if (!fieldMap[name]) {
          fieldMap[name] = field
        }
      }
    }

    return Object.keys(fieldMap).sort().map((name) => fieldMap[name])
  }

  static _toString(nodes) {
    const fields = Node._getFields(nodes)
    if (fields.length === 0) {
      return ''
    }

    return `{${ fields.join(',') }}`
  }
}

export class Query extends Node {
  constructor(action, args = [], fields, fragments) {
    super(fields, fragments)
    this.rootCall = action
    this.rootNode = new Call(action, args)
  }

  toString() {
    return this.rootNode.toString() + Node._toString([this])
  }

  toJSON() {
    return pack([ NodeType.QUERY, this.rootNode.name, this.rootNode.args, this.fields, this.fragments ])
  }

  static fromJSON(data) {
    const [ type, action, args = [], fields = [], fragments = [] ] = data
    if (type !== NodeType.QUERY) {
      throw new Error('Expected query descriptor')
    }

    return new Query(action, args, fields.map(Field.fromJSON), fragments.map(Fragment.fromJSON))
  }
}

export class Fragment extends Node {
  constructor(name, fields, fragments) {
    super(fields, fragments)
    this.name = name
  }

  toString() {
    return Node._toString([this])
  }

  toJSON() {
    return pack([ NodeType.FRAGMENT, this.name, this.fields, this.fragments ])
  }

  fromJSON(data) {
    const [ type, name, fields = [], fragments = [] ] = data
    if (type !== NodeType.FRAGMENT) {
      throw new Error('Expected fragment descriptor')
    }

    return new Fragment(name, fields.map(Field.fromJSON), fragments.map(Fragment.fromJSON))
  }
}

export class Field extends Node {
  constructor(name, fields, fragments, calls = []) {
    super(fields, fragments)
    this.name = name
    this.calls = calls
  }

  toString() {
    const calls = this.calls.length > 0
      ? '.' + this.calls.join('.') : ''

    return this.name + calls + Node._toString([this])
  }

  toJSON() {
    return pack([ NodeType.FIELD, this.name, this.fields, this.fragments, this.calls ])
  }

  static fromJSON(data) {
    const [ type, name, fields = [], fragments = [], calls = [] ] = data
    if (type !== NodeType.FIELD) {
      throw new Error('Expected field descriptor')
    }

    return new Field(name, fields.map(Field.fromJSON), fragments.map(Fragment.fromJSON), calls.map(Call.fromJSON))
  }
}

export class Call {
  constructor(name, args) {
    this.name = name
    this.args = args
  }

  toString() {
    return `${ this.name }(${ this.args.map(String).join(',') })`
  }

  toJSON() {
    return pack([ NodeType.CALL, this.name, this.args ])
  }

  static fromJSON(data) {
    const [ type, name, args = [] ] = data
    if (type !== NodeType.CALL) {
      throw new Error('Expected call descriptor')
    }

    return new Call(name, args)
  }
}
