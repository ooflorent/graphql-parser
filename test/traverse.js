import assert from 'assert'
import cloneDeep from 'lodash/lang/cloneDeep'
import traverse from '../src/traverse'

const ast = {
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
        }
      ],
      fields: [
        {
          type: 'Field',
          name: 'd',
          alias: null,
          params: [],
          fields: []
        },
        {
          type: 'Field',
          name: 'e',
          alias: null,
          params: [
            {
              type: 'Argument',
              name: 'f',
              value: {
                type: 'Literal',
                value: 30
              }
            }
          ],
          fields: [
            {
              type: 'Field',
              name: 'g',
              alias: null,
              params: [],
              fields: []
            },
            {
              type: 'Field',
              name: 'h',
              alias: null,
              params: [],
              fields: []
            }
          ]
        }
      ]
    },
    {
      type: 'Field',
      name: 'i',
      alias: null,
      params: [],
      fields: []
    }
  ]
}

describe('traverse', () => {
  it('does not traverse falsy nodes', () => {
    traverse(null, {})
  })

  it('passes through all fields', () => {
    const fields = []
    const args = []

    traverse(cloneDeep(ast), {
      Field(node) {
        fields.push(node.name)
      },
      Argument(node) {
        args.push(node.name)
      }
    })

    assert.deepEqual(fields, ['d', 'g', 'h', 'e', 'a', 'i'])
    assert.deepEqual(args, ['b', 'f'])
  })

  it('replaces nodes', () => {
    const actual = traverse(cloneDeep(ast), {
      Argument(node) {
        node.name = node.name.toUpperCase()
      },
      Literal(node) {
        return node.value
      },
    })

    assert.equal(actual.fields[0].params[0].name, 'B')
    assert.equal(actual.fields[0].fields[1].params[0].name, 'F')
    assert.equal(actual.fields[0].fields[1].params[0].value, 30)
  })
})
