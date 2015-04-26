import Tokenizer, { TokenType } from './tokenizer'

export default class Parser extends Tokenizer {
  match(type) {
    return this.lookahead.type === type
  }

  eat(type) {
    if (this.match(type)) {
      return this.lex()
    }

    return null
  }

  expect(type) {
    if (this.match(type)) {
      return this.lex()
    }

    throw this.createUnexpected(this.lookahead)
  }

  parseQuery() {
    return { type: 'Query', fields: this.parseFieldList() }
  }

  parseIdentifier() {
    return this.expect(TokenType.IDENTIFIER).value
  }

  parseFieldList() {
    this.expect(TokenType.LBRACE)

    const fields = []
    let first = true

    while (!this.match(TokenType.RBRACE) && !this.end()) {
      if (first) {
        first = false
      } else {
        this.expect(TokenType.COMMA)
      }

      if (this.match(TokenType.AMP)) {
        fields.push(this.parseReference())
      } else {
        fields.push(this.parseField())
      }
    }

    this.expect(TokenType.RBRACE)
    return fields
  }

  parseField() {
    const name = this.parseIdentifier()
    const params = this.match(TokenType.LPAREN) ? this.parseArgumentList() : []
    const alias = this.eat(TokenType.AS) ? this.parseIdentifier() : null
    const fields = this.match(TokenType.LBRACE) ? this.parseFieldList() : []

    return { type: 'Field', name, alias, params, fields }
  }

  parseArgumentList() {
    const args = []
    let first = true

    this.expect(TokenType.LPAREN)

    while (!this.match(TokenType.RPAREN) && !this.end()) {
      if (first) {
        first = false
      } else {
        this.expect(TokenType.COMMA)
      }

      args.push(this.parseArgument())
    }

    this.expect(TokenType.RPAREN)
    return args
  }

  parseArgument() {
    const name = this.parseIdentifier()
    this.expect(TokenType.COLON)
    const value = this.parseValue()

    return { type: 'Argument', name, value }
  }

  parseValue() {
    switch (this.lookahead.type) {
      case TokenType.AMP:
        return this.parseReference()

      case TokenType.LT:
        return this.parseVariable()

      case TokenType.NUMBER:
      case TokenType.STRING:
        return { type: 'Literal', value: this.lex().value }

      case TokenType.NULL:
      case TokenType.TRUE:
      case TokenType.FALSE:
        return { type: 'Literal', value: JSON.parse(this.lex().value) }
    }

    throw this.createUnexpected(this.lookahead)
  }

  parseReference() {
    this.expect(TokenType.AMP)

    if (this.match(TokenType.NUMBER) || this.match(TokenType.IDENTIFIER)) {
      return { type: 'Reference', name: this.lex().value }
    }

    throw this.createUnexpected(this.lookahead)
  }

  parseVariable() {
    this.expect(TokenType.LT)
    const name = this.expect(TokenType.IDENTIFIER).value
    this.expect(TokenType.GT)

    return { type: 'Variable', name }
  }
}
