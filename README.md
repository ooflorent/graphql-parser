# graphql-paser

## Install

```sh
npm install --save graphql-parser
```

## Usage

```js
import graphql from graphql-parser

const IMAGE_WIDTH = 80
const IMAGE_HEIGHT = 80

const PostFragment = graphql`
  post {
    title,
    published_at,
  }
`
const UserQuery = graphql`
  user(<id>) {
    nickname,
    avatar.resize(${IMAGE_WIDTH}, ${IMAGE_HEIGHT}) {
      url
    },
    posts.first(<count>) {
      count,
      edges {
        node {
          ${ PostFragment() }
        }
      }
    }
  }
`

const query = UserQuery({
  id: 1337,
  count: 10,
})
```
