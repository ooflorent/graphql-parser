import {expect} from 'chai'
import parse from '../src/parser'

describe('Parser', () => {
  describe('node', () => {
    it('parses root calls', () => {
      parse(`viewer() { id }`)
    })

    it('parses query fragments', () => {
      parse(`viewer { id }`)
    })
  })
})
