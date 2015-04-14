import {expect} from 'chai'
import * as parser from '../src/parser'

describe('Parser', () => {
  describe('node', () => {
    const node = parser.node

    it('parses root calls', () => {
      node.parse(`viewer() { id }`)
    })

    it('parses query fragments', () => {
      node.parse(`viewer { id }`)
    })
  })

  describe('fields', () => {
    const fields = parser.fields

    it('finds fields', () => {
      fields.parse(`{ id }`)
      fields.parse(`{ id, name }`)
      fields.parse(`{\n  id,\n  name\n}`)
    })

    it('finds nested fields', () => {
      fields.parse(`
        {
          id,
          date_of_birth {
            month,
            year
          }
        }
      `)
    })
  })
})
