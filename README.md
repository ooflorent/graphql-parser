# graphql-parser

## Install

```sh
npm install --save graphql-parser
```

## Usage

```js
import graphql from 'graphql-parser'

const IMAGE_WIDTH = 80
const IMAGE_HEIGHT = 80

// Compile a fragment
const PostFragment = graphql`
  {
    id,
    title,
    published_at
  }
`

// Compile a query
const UserQuery = graphql`
  {
    user(id: <id>) {
      id,
      nickname,
      avatar(width: ${IMAGE_WIDTH}, height: ${IMAGE_HEIGHT}) {
        url(protocol: "https")
      },
      posts(first: <count>) {
        count,
        edges {
          node as post {
            ${ PostFragment() }
          }
        }
      }
    }
  }
`

// Generate a GraphQL query
const query = UserQuery({
  id: 1337,
  count: 10,
})
```

## AST manipulation

```js
import { parse, traverse } from 'graphql-parser'

// Parsing
// -------

const ast = parse(`
  {
    post(slug: <slug>) {
      id,
      title,
      image(width: 50, height: 50) as cover {
        url
      }
    }
  }
`)

// Traversal
// ---------

const ctx = {
  slug: "/graphql-is-hot"
}

const obj = traverse(ast, {
  // Lookup variables
  Variable(node) {
    return ctx[node.name]
  }
})

```
