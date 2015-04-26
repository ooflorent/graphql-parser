This document specifies the core AST node types that support the GraphQL grammar.

# Node object

AST nodes are represented as `Node` objects, which may have any prototype inheritance but which implement the following interface:

```js
interface Node {
  type: string;
}
```

The `type` field is a string representing the AST variant type. Each subtype of `Node` is documented below with the specific string of its type field. You can use this field to determine which interface a node implements.

# Query

```js
interface Query <: Node {
  type: "Query";
  fields: [ Field ];
}
```

A query source tree. It may also describe field fragments.

# Field

```js
interface Field <: Node {
  type: "Field";
  name: string;
  params: [ Argument ];
  fields: [ Field ];
}
```

A field declaration.

# Argument

```js
interface Argument <: Node {
  type: "Argument";
  name: string;
  value: [ Literal | Variable | Reference ];
}
```

A named argument.

# Literal

```js
interface Literal <: Node {
  type: "Literal";
  value: string | boolean | number | null;
}
```

A JSON literal token. See [ECMA-404][ecma-404] specification.

# Variable

```js
interface Variable <: Node {
  type: "Variable";
  name: string;
}
```

A query variable.

# Reference

```js
interface Reference <: Node {
  type: "Reference";
  name: string;
}
```

A reference to a context value. Used for internal usage.

[ecma-404]: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf
