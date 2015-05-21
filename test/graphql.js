import assert from 'assert'
import graphql from '../src/graphql'

describe('graphql', () => {
  it('parses queries', () => {
    const query = graphql`
      {
        a(b: true, c: <d>) as e {
          f { g, h },
          i(j: 50)
        },
        k(l: null) {
          m, n
        }
      }
    `

    assert.deepEqual(query({d: 42}), {
      a: {
        alias: 'e',
        params: {
          b: true,
          c: 42
        },
        fields: {
          f: {
            fields: {
              g: {},
              h: {}
            }
          },
          i: {
            params: {
              j: 50
            }
          }
        }
      },
      k: {
        params: {
          l: null
        },
        fields: {
          m: {},
          n: {}
        }
      }
    })
  })

  it('parses query fragments', () => {
    const queryA = graphql`
      {
        a,
        b(c: ${ "d" })
      }
    `

    const queryB = graphql`
      {
        ${ queryA() },
        e,
        f
      }
    `

    assert.deepEqual(queryB(), {
      a: {},
      b: {
        params: {
          c: 'd'
        }
      },
      e: {},
      f: {}
    })
  })
})
