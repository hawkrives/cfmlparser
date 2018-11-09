module.exports = class AbstractParser {
  constructor() {
    this.statements = [];
  }

  parse() {
    throw "The parse is abstract, please use a child class";
  }

  addStatement(s) {
    this.statements.push(s);
  }

  getStatements() {
    return this.statements;
  }

  subString(str, start = 1, end = len(str)) {
    if (start >= end) {
      return "";
    }
    return mid(str, start, end - start);
  }

  isScript() {
    return false;
  }
};
