/**
 * Safe Expression Evaluator
 * Evaluates mathematical expressions without using eval()
 * Prevents code injection and arbitrary code execution
 */

class TokenType {
  static NUMBER = "NUMBER";
  static PLUS = "PLUS";
  static MINUS = "MINUS";
  static MULTIPLY = "MULTIPLY";
  static DIVIDE = "DIVIDE";
  static MODULO = "MODULO";
  static LPAREN = "LPAREN";
  static RPAREN = "RPAREN";
  static EOF = "EOF";
}

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

/**
 * Tokenizer for mathematical expressions
 * Only supports numbers, basic operators, and parentheses
 */
class Tokenizer {
  constructor(expr) {
    this.expr = expr;
    this.pos = 0;
  }

  currentChar() {
    if (this.pos >= this.expr.length) {
      return null;
    }
    return this.expr[this.pos];
  }

  advance() {
    this.pos++;
  }

  skipWhitespace() {
    while (this.currentChar() && /\s/.test(this.currentChar())) {
      this.advance();
    }
  }

  readNumber() {
    let result = "";
    while (this.currentChar() && /[\d.]/.test(this.currentChar())) {
      result += this.currentChar();
      this.advance();
    }
    return parseFloat(result);
  }

  getNextToken() {
    while (this.currentChar()) {
      if (/\s/.test(this.currentChar())) {
        this.skipWhitespace();
        continue;
      }

      if (/[\d.]/.test(this.currentChar())) {
        return new Token(TokenType.NUMBER, this.readNumber());
      }

      if (this.currentChar() === "+") {
        this.advance();
        return new Token(TokenType.PLUS, "+");
      }

      if (this.currentChar() === "-") {
        this.advance();
        return new Token(TokenType.MINUS, "-");
      }

      if (this.currentChar() === "*") {
        this.advance();
        return new Token(TokenType.MULTIPLY, "*");
      }

      if (this.currentChar() === "/") {
        this.advance();
        return new Token(TokenType.DIVIDE, "/");
      }

      if (this.currentChar() === "%") {
        this.advance();
        return new Token(TokenType.MODULO, "%");
      }

      if (this.currentChar() === "(") {
        this.advance();
        return new Token(TokenType.LPAREN, "(");
      }

      if (this.currentChar() === ")") {
        this.advance();
        return new Token(TokenType.RPAREN, ")");
      }

      throw new Error(`Invalid character: ${this.currentChar()}`);
    }

    return new Token(TokenType.EOF, null);
  }
}

/**
 * Parser for mathematical expressions
 * Implements precedence: parentheses > multiply/divide > add/subtract
 */
class Parser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.getNextToken();
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.tokenizer.getNextToken();
    } else {
      throw new Error(`Invalid syntax: expected ${tokenType}, got ${this.currentToken.type}`);
    }
  }

  factor() {
    const token = this.currentToken;

    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      return token.value;
    }

    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const result = this.expr();
      this.eat(TokenType.RPAREN);
      return result;
    }

    if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      return -this.factor();
    }

    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS);
      return this.factor();
    }

    throw new Error(`Invalid syntax: unexpected ${token.type}`);
  }

  term() {
    let result = this.factor();

    while (this.currentToken.type in [TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO]) {
      const token = this.currentToken;

      if (token.type === TokenType.MULTIPLY) {
        this.eat(TokenType.MULTIPLY);
        result *= this.factor();
      }

      if (token.type === TokenType.DIVIDE) {
        this.eat(TokenType.DIVIDE);
        const divisor = this.factor();
        if (divisor === 0) {
          throw new Error("Division by zero");
        }
        result /= divisor;
      }

      if (token.type === TokenType.MODULO) {
        this.eat(TokenType.MODULO);
        result %= this.factor();
      }
    }

    return result;
  }

  expr() {
    let result = this.term();

    while (this.currentToken.type in [TokenType.PLUS, TokenType.MINUS]) {
      const token = this.currentToken;

      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
        result += this.term();
      }

      if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
        result -= this.term();
      }
    }

    return result;
  }

  parse() {
    const result = this.expr();
    if (this.currentToken.type !== TokenType.EOF) {
      throw new Error("Invalid syntax: unexpected tokens after expression");
    }
    return result;
  }
}

/**
 * Safe evaluator that validates and evaluates expressions
 * @param {string} expression - The expression to evaluate
 * @returns {number} The result of the evaluation
 * @throws {Error} If the expression is invalid
 */
export function evaluateMathExpression(expression) {
  if (typeof expression !== "string") {
    throw new Error("Expression must be a string");
  }

  // Remove any content that looks like code
  if (/[;{}]/.test(expression)) {
    throw new Error("Invalid characters in expression");
  }

  try {
    const tokenizer = new Tokenizer(expression);
    const parser = new Parser(tokenizer);
    return parser.parse();
  } catch (error) {
    throw new Error(`Expression evaluation error: ${error.message}`);
  }
}

export default evaluateMathExpression;
