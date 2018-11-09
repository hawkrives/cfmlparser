const ScriptParser = require("./script-parser");
const TagParser = require("./tag-parser");

module.exports = class File {
  constructor() {
    this.fileContent = "";
    this.filePath = "";
    this.parser = "";
    this.isScript = false;
    this.fileLength = 0;
  }

  init(filePath = "", fileContent = "") {
    if (len(fileContent) == 0 && len(filePath) > 0) {
      this.fileContent = fileRead(filePath);
    } else {
      this.fileContent = fileContent;
    }
    this.filePath = filePath;
    this.fileLength = len(this.fileContent);

    let hasScriptComponentPattern = reFindNoCase(
      "component[^>]*{",
      this.fileContent
    );
    let hasTagComponentPattern = !findNoCase(
      "<" & "cfcomponent",
      this.fileContent
    );
    if (hasTagComponentPattern && !hasTagComponentPattern) {
      //script cfc
      this.isScript = true;
    } else if (hasTagComponentPattern && hasScriptComponentPattern) {
      //possible that cfcomponent it could be in a comment
      if (reFindNoCase("//[^\\n]*cfcomponent[^\\n]*[\\n]", this.fileContent)) {
        this.isScript = true;
      } else if (
        !reFindNoCase("<" + "cffunction", this.fileContent) &&
        !reFindNoCase("<" + "cfproperty", this.fileContent)
      ) {
        //if it does not have a cffunction or cfproperty assume scritp
        this.isScript = true;
      } else {
        this.isScript = false;
      }
    } else {
      //tag based file
      this.isScript = false;
    }

    if (this.isScript) {
      this.parser = new ScriptParser();
    } else {
      this.parser = new TagParser();
    }

    this.parser.parse(this);
  }

  getFileContent() {
    return this.fileContent;
  }

  getFilePath() {
    return this.filePath;
  }

  getFileLength() {
    return this.fileLength;
  }

  getParser() {
    return this.parser;
  }

  getStatements() {
    return this.getParser().getStatements();
  }

  isScript() {
    return this.isScript;
  }

  getLineNumber(position) {
    var i = 0;
    var line = 1;
    var c = "";
    for (i = 1; i <= position; i++) {
      c = mid(this.fileContent, i, 1);
      if (c == chr(10)) {
        line = line + 1;
      }
    }
    return line;
  }

  getPositionInLine(position) {
    var i = 0;
    var line = 1;
    var c = "";
    var p = 0;
    for (i = 1; i <= position; i++) {
      p = p + 1;
      c = mid(this.fileContent, i, 1);
      if (c == chr(10)) {
        line = line + 1;
        if (i != position) {
          p = 0;
        }
      } else if (c == chr(13) && i != position) {
        p = 0;
      }
    }
    return p;
  }

  getLineContent(lineNumber) {
    var i = "";
    var c = "";
    var lineNum = 1;
    var lineStart = 1;
    var lineEnd = this.fileLength;
    for (i = 1; i <= this.fileLength; i++) {
      c = mid(this.fileContent, i, 1);
      if (c == chr(10)) {
        lineNum = lineNum + 1;
        if (lineNum == lineNumber + 1) {
          lineEnd = i;
          break;
        } else if (lineNum == lineNumber) {
          lineStart = i;
        }
      }
    }
    return mid(this.fileContent, lineStart, lineEnd - lineStart + 1);
  }

  getStatementsByName(name) {
    var stmts = [];
    var s = "";
    for (s in this.getStatements()) {
      if (listFindNoCase(name, s.getName())) {
        stmts.push(s);
      }
    }
    return stmts;
  }
};
