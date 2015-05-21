import assert from 'assert'
import parse from '../src/parse'

function run(query, expected) {
  it(query, () => {
    assert.deepEqual(parse(query), expected)
  })
}

describe('parse', () => {
  describe('fields', () => {
    // Nesting
    run('{ a, b { c { d } } }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: null,
          params: [],
          fields: []
        },
        {
          type: 'Field',
          name: 'b',
          alias: null,
          params: [],
          fields: [
            {
              type: 'Field',
              name: 'c',
              alias: null,
              params: [],
              fields: [
                {
                  type: 'Field',
                  name: 'd',
                  alias: null,
                  params: [],
                  fields: []
                }
              ]
            }
          ]
        }
      ]
    })

    // Aliases
    run('{ a as b, c(d: 1) as e { f } }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: 'b',
          params: [],
          fields: []
        },
        {
          type: 'Field',
          name: 'c',
          alias: 'e',
          params: [
            {
              type: 'Argument',
              name: 'd',
              value: {
                type: 'Literal',
                value: 1
              }
            }
          ],
          fields: [
            {
              type: 'Field',
              name: 'f',
              alias: null,
              params: [],
              fields: []
            }
          ]
        }
      ]
    })
  })

  describe('arguments', () => {
    // Booleans & null
    run('{ a(b: true, c: false, d: null) }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: null,
          params: [
            {
              type: 'Argument',
              name: 'b',
              value: {
                type: 'Literal',
                value: true
              }
            },
            {
              type: 'Argument',
              name: 'c',
              value: {
                type: 'Literal',
                value: false
              }
            },
            {
              type: 'Argument',
              name: 'd',
              value: {
                type: 'Literal',
                value: null
              }
            }
          ],
          fields: []
        }
      ]
    })

    // Numbers
    run('{ a(b: 1, c: -12.34, d: 23.9E+6) }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: null,
          params: [
            {
              type: 'Argument',
              name: 'b',
              value: {
                type: 'Literal',
                value: 1
              }
            },
            {
              type: 'Argument',
              name: 'c',
              value: {
                type: 'Literal',
                value: -12.34
              }
            },
            {
              type: 'Argument',
              name: 'd',
              value: {
                type: 'Literal',
                value: 23900000
              }
            }
          ],
          fields: []
        }
      ]
    })

    // Strings
    run('{ a(b: "test", c: "") }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: null,
          params: [
            {
              type: 'Argument',
              name: 'b',
              value: {
                type: 'Literal',
                value: 'test'
              }
            },
            {
              type: 'Argument',
              name: 'c',
              value: {
                type: 'Literal',
                value: ''
              }
            }
          ],
          fields: []
        }
      ]
    })

    // Variables & references
    run('{ a(b: <c>, d: &e) }', {
      type: 'Query',
      fields: [
        {
          type: 'Field',
          name: 'a',
          alias: null,
          params: [
            {
              type: 'Argument',
              name: 'b',
              value: {
                type: 'Variable',
                name: 'c'
              }
            },
            {
              type: 'Argument',
              name: 'd',
              value: {
                type: 'Reference',
                name: 'e'
              }
            }
          ],
          fields: []
        }
      ]
    })
  })
})
