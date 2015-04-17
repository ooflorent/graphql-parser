# Node object

```js
interface Node {
  type: string;
}
```

# Root objects

```js
interface RootNode <: Node;
```

## Query

```js
interface Query <: RootNode {
  type: "Query";
  name: string;
  arguments: [ Identifier | Literal ];
  fields: [ Field ];
  fragments: [ Fragment | FragmentIdentifier ];
}

```

## Fragment

```js
interface Fragment <: RootNode {
  type: "Fragment";
  name: string;
  fields: [ Field ];
  fragments: [ Fragment | FragmentIdentifier ];
}
```

# Field descriptors

## Field

```js
interface Field <: Node {
  type: "Field";
  name: string;
  calls: [ Call ] | null;
  fields: [ Field ];
  fragments: [ Fragment | FragmentIdentifier ];
}
```

## Call

```js
interface Call <: Node {
  type: "Call";
  name: string;
  arguments: [ Identifier | Literal ];
}
```

# Miscellaneous

## Identifier

```js
interface Identifier <: Node {
  type: "Identifier";
  name: string;
}
```

## FragmentIdentifier

```js
interface FragmentIdentifier <: Node {
  type: "FragmentIdentifier";
  name: string;
}
```

## Literal

```js
interface Literal <: Node {
  type: "Literal";
  value: string | boolean | number | null | Object | Array ;
}
```
