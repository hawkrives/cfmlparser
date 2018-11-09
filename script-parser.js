const AbstractParser = require("./abstract-parser");
const Comment = require("./comment");
const ScriptStatement = require("./script-statement");

const STATE = {
	NONE: 0,
	COMMENT: 1,
	IF_STATEMENT: 2,
	ELSE_IF_STATEMENT: 3,
	ELSE_STATEMENT: 4,
	SWITCH_STATEMENT: 5,
	STATEMENT: 6,
	COMPONENT_STATEMENT: 7,
	FOR_LOOP: 8,
	WHILE_LOOP: 9,
	RETURN_STATEMENT: 10,
	CLOSURE: 11,
	FUNCTION_STATEMENT: 12
};

module.exports = class ScriptParser extends AbstractParser {
	parse(file) {
		let content = file.getFileContent();
		let contentLength = file.getFileLength();
		let pos = 1;
		let parent = "";
		let currentState = STATE.NONE;
		let c = "";
		let endPos = 0;
		let temp = "";
		let paren = 0;
		let braceOpen = 0;
		let semi = 0;
		let quotePos = 0;
		let eqPos = 0;
		let lineEnd = 0;
		let inString = false;
		let stringOpenChar = "";
		let currentStatement = "";
		let currentStatementStart = 1;
		let commentStatement = "";
		// let sb = createObject("java", "java.lang.StringBuilder");

		let jsString = "";

		while (pos <= contentLength) {
			c = mid(content, pos, 1);

			if (c == "'" || c == '"') {
				if (inString && stringOpenChar == c) {
					let doubled = c + c;
					if (mid(content, pos, 2) != doubled) {
						inString = false; //end string
					} else {
						//escaped string open char
						jsString += c;
						jsString += c;
						pos = pos + 2;
						continue;
					}
				} else if (!inString) {
					inString = true;
					stringOpenChar = c;
				}
				jsString += c;
			} else if (!inString) {
				if (c == "/" && mid(content, pos, 2) == "/*") {
					//currentState = STATE.COMMENT;
					commentStatement = new Comment({
						name: "/*",
						startPosition: pos,
						parent: parent,
						file: file
					});
					if (!isSimpleValue(parent)) {
						parent.addChild(commentStatement);
					}
					endPos = find("*/", content, pos + 3);
					if (endPos == 0) {
						//end of doc
						endPos = contentLength;
					}
					commentStatement.setEndPosition(endPos);
					this.addStatement(commentStatement);
					pos = endPos + 1;
					//currentState = STATE.NONE;

					continue;
				} else if (c == "/" && mid(content, pos, 2) == "//") {
					endPos = reFind("[\r\n]", content, pos + 2);
					if (endPos == 0) {
						//end of doc
						endPos = contentLength;
					}

					commentStatement = new Comment({
						name: "//",
						startPosition: pos,
						file: file,
						parent: parent
					});
					commentStatement.setEndPosition(endPos);
					this.addStatement(commentStatement);
					if (!isSimpleValue(parent)) {
						parent.addChild(commentStatement);
					}
					pos = endPos + 1;
					//currentState = STATE.NONE;
					continue;
				} else if (c == "}") {
					if (currentState == STATE.CLOSURE) {
						currentState = STATE.STATEMENT;
						jsString += c;
					} else {
						if (!isSimpleValue(parent)) {
							parent.setBodyClose(pos);
							parent.setEndPosition(pos);
							parent = parent.getParent();
						} else {
							parent = "";
						}
						currentState = STATE.NONE;
						jsString = "";
					}
				} else if (c == "{") {
					if (currentState == STATE.STATEMENT) {
						//a closure?
						currentState = STATE.CLOSURE;
						jsString += c;
					} else {
						currentStatement.setBodyOpen(pos);
						parent = currentStatement;
						currentState = STATE.NONE;
						jsString = "";
					}
				} else if (c == ";") {
					//TODO handle case where if/else if/else/for/while does not use {}
					if (currentState == STATE.STATEMENT) {
						currentState = STATE.NONE;

						currentStatement.setEndPosition(pos);
						if (!isSimpleValue(parent)) {
							parent = currentStatement.getParent();
						}
						jsString = "";
					} else {
						jsString += ";";
					}
				} else if (currentState == STATE.NONE) {
					if (reFind("[a-z_]", c)) {
						//some letter

						jsString = "";
						if (c == "c" && mid(content, pos, 9) == "component") {
							currentStatement = new ScriptStatement({
								name: "component",
								startPosition: pos,
								file: file,
								parent: parent
							});
							this.addStatement(currentStatement);
							parent = currentStatement;
							pos = pos + 9;
							jsString += "component";
							currentState = STATE.COMPONENT_STATEMENT;
							continue;
						} else if (
							c == "f" &&
							reFind("function[\t\r\n a-zA-Z_]", mid(content, pos, 9))
						) {
							//a function without access modifier or return type
							jsString += "function";
							currentState = STATE.FUNCTION_STATEMENT;
							currentStatement = new ScriptStatement({
								name: "function",
								startPosition: pos,
								file: file,
								parent: parent
							});
							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							pos = pos + 8;
							continue;
						} else if (
							c == "i" &&
							reFind("if[\t\r\n (]", mid(content, pos, 3))
						) {
							currentStatementStart = pos;
							currentStatement = new ScriptStatement({
								name: "if",
								startPosition: pos,
								file: file,
								parent: parent
							});
							parent = currentStatement;
							currentState = STATE.IF_STATEMENT;

							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							jsString += "if";
							pos = pos + 2;
							continue;
						} else if (
							c == "e" &&
							reFind("else[ \t\r\n]+if[\t\r\n (]", content, pos) == pos
						) {
							currentStatementStart = pos;
							currentStatement = new ScriptStatement({
								name: "else if",
								startPosition: pos,
								file: file,
								parent: parent
							});
							currentState = STATE.ELSE_IF_STATEMENT;
							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							parent = currentStatement;
							paren = find("(", content, pos + 1);
							jsString += mid(content, pos, paren - pos);
							pos = paren;
							continue;
						} else if (
							c == "e" &&
							reFind("else[\t\r\n (]", content, pos) == pos
						) {
							currentStatementStart = pos;
							currentStatement = new ScriptStatement({
								name: "else",
								startPosition: pos,
								file: file,
								parent: parent
							});
							parent = currentStatement;
							currentState = STATE.ELSE_STATEMENT;
							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							jsString += "else";
							pos = pos + 4;
							continue;
						} else if (c == "v" && mid(content, pos, 4).trim() == "let") {
							currentStatement = new ScriptStatement({
								name: "let",
								startPosition: pos,
								file: file,
								parent: parent
							});
							currentState = STATE.STATEMENT;
							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							parent = currentStatement;
							jsString += "let ";
							pos = pos + 4;
							continue;
						} else if (
							c == "r" &&
							reFind("return[\t\r\n ;]", mid(content, pos, 7)) == pos
						) {
							currentStatement = new ScriptStatement({
								name: "return",
								startPosition: pos,
								file: file,
								parent: parent
							});
							currentState = STATE.RETURN_STATEMENT;
							this.addStatement(currentStatement);
							if (!isSimpleValue(parent)) {
								parent.addChild(currentStatement);
							}
							jsString += "return";
							pos = pos + 6;
							continue;
						} else {
							//either a statement or a function
							/* cases to handle
								public foo function (delim=";") { }
								x = "function(){}";
								x = foo();
								doIt(d=";");
								some_function = good;
								x = {foo=moo};
								closures
								foo = function(x) {return x+1; };
								sub = op(10,20,function(numeric N1, numeric N2) { return N1-N2; });
							*/
							braceOpen = find("{", content, pos + 1);
							semi = find(";", content, pos + 1);
							paren = find("(", content, pos + 1);
							quotePos = reFind("['\"]", content, pos + 1);
							temp = reFind(
								"[^a-zA-Z0-9_.]*function[\t\r\n ]+[a-zA-Z_]",
								content,
								pos
							);

							if (pos == 41) {
								//throw(message="sb=#sb.toString()#|" &serializeJSON(local))
							}

							if (temp == 0) {
								//no function keyword found ahead
								currentState = STATE.STATEMENT;
							} else if (temp > semi && semi != 0) {
								currentState = STATE.STATEMENT;
							} else if (semi != 0 && semi < braceOpen && semi < paren) {
								//a statement because ; found before ( and {
								currentState = STATE.STATEMENT;
							} else if (quotePos < semi && semi < braceOpen) {
								//a statement because found quote before ; and ; before {
								currentState = STATE.STATEMENT;
							} else if (temp < semi && temp != 0) {
								eqPos = find("=", content, pos + 1);
								if (paren != 0 && paren < temp) {
									//a closure because paren found before function
									currentState = STATE.STATEMENT;
								} else if (eqPos != 0 && eqPos < temp) {
									//a closure because = found before function
									currentState = STATE.STATEMENT;
								} else {
									//a func because function before ; found
									currentState = STATE.FUNCTION_STATEMENT;
								}
							}

							if (currentState == STATE.FUNCTION_STATEMENT) {
								//a function

								currentStatementStart = pos;
								currentStatement = new ScriptStatement({
									name: "statement",
									startPosition: pos,
									file: file,
									parent: parent
								});
								this.addStatement(currentStatement);
								if (!isSimpleValue(parent)) {
									parent.addChild(currentStatement);
								}
								parent = currentStatement;
								jsString += c;
							} else {
								//statement
								currentState = STATE.STATEMENT;
								currentStatementStart = pos;
								currentStatement = new ScriptStatement({
									name: "statement",
									startPosition: pos,
									file: file,
									parent: parent
								});

								this.addStatement(currentStatement);
								if (!isSimpleValue(parent)) {
									parent.addChild(currentStatement);
								}
								jsString += c;
							}
						}
					} else {
						jsString += c;
					}
				} else {
					jsString += c;
				}
			} else {
				//inString
				jsString += c;
			}

			pos = pos + 1;
		}
	}

	isScript() {
		return true;
	}
};
