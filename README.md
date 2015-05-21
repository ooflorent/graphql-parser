# graphql-parser

> Experimental Facebook's GraphQL parser

This parser is inspired by Facebook's articles about GraphQL. It supports the latest shown syntax.

* [Introducing Relay and GraphQL][fb-1]
* [Building The Facebook News Feed With Relay][fb-2]
* [GraphQL Introduction][fb-3] (current implementation)

## Install

```sh
npm install --save graphql-parser
```

## Usage

`graphql-parser` exposes a tagged template function for parsing GraphQL queries. It outputs a function generating a JS object describing the query.

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

In the above example output will be:

```js
{
  "user": {
    "params": {
      "id": 1337
    },
    "fields": {
      "id": {},
      "nickname": {},
      "avatar": {
        "params": {
          "width": 80,
          "height": 80
        },
        "fields": {
          "url": {
            "params": {
              "protocol": "https"
            }
          }
        }
      },
      "posts": {
        "params": {
          "first": 10
        },
        "fields": {
          "count": {},
          "edges": {
            "fields": {
              "node": {
                "alias": "post",
                "fields": {
                  "id": {},
                  "title": {},
                  "published_at": {}
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## AST manipulation

`graphql-parser` also exposes lower level API for generating [GraphQL AST][docs-ast] and traversing it.

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

[docs-ast]: docs/ast.md
[fb-1]: https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html
[fb-2]: https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html
[fb-3]: https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html
