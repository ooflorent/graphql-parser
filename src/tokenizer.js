export const TokenClass = {
  End: {name: 'End'},
  Punctuator: {name: 'Punctuator'},
  Keyword: {name: 'Keyword'},
  Identifier: {name: 'Identifier'},
  NumberLiteral: {name: 'Number'},
  StringLiteral: {name: 'String'},
}

export const TokenType = {
  // Special
  END:        {klass: TokenClass.End, name: 'end'},
  IDENTIFIER: {klass: TokenClass.Identifier, name: 'identifier'},
  NUMBER:     {klass: TokenClass.NumberLiteral, name: 'number'},
  STRING:     {klass: TokenClass.StringLiteral, name: 'string'},

  // Punctuators
  LT:     {klass: TokenClass.Punctuator, name: '<'},
  GT:     {klass: TokenClass.Punctuator, name: '>'},
  LBRACE: {klass: TokenClass.Punctuator, name: '{'},
  RBRACE: {klass: TokenClass.Punctuator, name: '}'},
  LPAREN: {klass: TokenClass.Punctuator, name: '('},
  RPAREN: {klass: TokenClass.Punctuator, name: ')'},
  COLON:  {klass: TokenClass.Punctuator, name: ':'},
  COMMA:  {klass: TokenClass.Punctuator, name: ','},
  AMP:    {klass: TokenClass.Punctuator, name: '&'},

  // Keywords
  NULL:  {klass: TokenClass.Keyword, name: 'null'},
  TRUE:  {klass: TokenClass.Keyword, name: 'true'},
  FALSE: {klass: TokenClass.Keyword, name: 'false'},
  AS:    {klass: TokenClass.Keyword, name: 'as'},
}

export default class Tokenizer {
  constructor(source) {
    this.source = source
    this.pos = 0
    this.line = 1
    this.lineStart = 0
    this.lookahead = this.next()
  }

  get column() {
    return this.pos - this.lineStart
  }

  getKeyword(name) {
    switch (name) {
      case 'null': return TokenType.NULL
      case 'true': return TokenType.TRUE
      case 'false': return TokenType.FALSE
      case 'as': return TokenType.AS
    }

    return TokenType.IDENTIFIER
  }

  end() {
    return this.lookahead.type === TokenType.END
  }

  peek() {
    return this.lookahead
  }

  lex() {
    const prev = this.lookahead
    this.lookahead = this.next()
    return prev
  }

  next() {
    this.skipWhitespace()

    const line = this.line
    const lineStart = this.lineStart
    const token = this.scan()

    token.line = line
    token.column = this.pos - lineStart

    return token
  }

  scan() {
    if (this.pos >= this.source.length) {
      return { type: TokenType.END }
    }

    const ch = this.source.charAt(this.pos)
    switch (ch) {
      case '(': ++this.pos; return { type: TokenType.LPAREN }
      case ')': ++this.pos; return { type: TokenType.RPAREN }
      case '{': ++this.pos; return { type: TokenType.LBRACE }
      case '}': ++this.pos; return { type: TokenType.RBRACE }
      case '<': ++this.pos; return { type: TokenType.LT }
      case '>': ++this.pos; return { type: TokenType.GT }
      case '&': ++this.pos; return { type: TokenType.AMP }
      case ',': ++this.pos; return { type: TokenType.COMMA }
      case ':': ++this.pos; return { type: TokenType.COLON }
    }

    if (ch === '_' || ch === '$' || 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z') {
      return this.scanWord()
    }

    if (ch === '-' || '0' <= ch && ch <= '9') {
      return this.scanNumber()
    }

    if (ch === '"') {
      return this.scanString()
    }

    throw this.createIllegal()
  }

  scanPunctuator() {
    const glyph = this.source.charAt(this.pos++)
    return { type: glyph }
  }

  scanWord() {
    const start = this.pos
    this.pos++

    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos)
      if (ch === '_' || ch === '$' || 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '0' <= ch && ch <= '9') {
        this.pos++
      } else {
        break
      }
    }

    const value = this.source.slice(start, this.pos)
    return { type: this.getKeyword(value), value }
  }

  scanNumber() {
    const start = this.pos

    if (this.source.charAt(this.pos) === '-') {
      this.pos++
    }

    this.skipInteger()

    if (this.source.charAt(this.pos) === '.') {
      this.pos++
      this.skipInteger()
    }

    let ch = this.source.charAt(this.pos)
    if (ch === 'e' || ch === 'E') {
      this.pos++

      ch = this.source.charAt(this.pos)
      if (ch === '+' || ch === '-') {
        this.pos++
      }

      this.skipInteger()
    }

    const value = parseFloat(this.source.slice(start, this.pos))
    return { type: TokenType.NUMBER, value }
  }

  scanString() {
    this.pos++

    let value = ''
    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos)
      if (ch === '"') {
        this.pos++
        return { type: TokenType.STRING, value }
      }

      if (ch === '\r' || ch === '\n') {
        break
      }

      value += ch
      this.pos++
    }

    throw this.createIllegal()
  }

  skipInteger() {
    const start = this.pos

    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos)
      if ('0' <= ch && ch <= '9') {
        this.pos++
      } else {
        break
      }
    }

    if (this.pos - start === 0) {
      throw this.createIllegal()
    }
  }

  skipWhitespace() {
    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos)
      if (ch === ' ' || ch === '\t') {
        this.pos++
      } else if (ch === '\r') {
        this.pos++
        if (this.source.charAt(this.pos) === '\n') {
          this.pos++
        }
        this.line++
        this.lineStart = this.pos
      } else if (ch === '\n') {
        this.pos++
        this.line++
        this.lineStart = this.pos
      } else {
        break
      }
    }
  }

  createError(message) {
    return new SyntaxError(message + ` (${this.line}:${this.column})`)
  }

  createIllegal() {
    return this.pos < this.source.length
      ? this.createError(`Unexpected ${this.source.charAt(this.pos)}`)
      : this.createError('Unexpected end of input')
  }

  createUnexpected(token) {
    switch (token.type.klass) {
      case TokenClass.End: return this.createError('Unexpected end of input')
      case TokenClass.NumberLiteral: return this.createError('Unexpected number')
      case TokenClass.StringLiteral: return this.createError('Unexpected string')
      case TokenClass.Identifier: return this.createError('Unexpected identifier')
      case TokenClass.Keyword: return this.createError(`Unexpected token ${token.value}`)
      case TokenClass.Punctuator: return this.createError(`Unexpected token ${token.type.name}`)
    }
  }
}
