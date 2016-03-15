component extends="Statement" {
	
	variables.endTagStartPosition = 0;
	variables.startTagEndPosition = 0;
	variables.attributeExpressions = [];

	
	public boolean function isTag() {
		return true;
	}

	public void function setEndTagStartPosition(position) {
		variables.endTagStartPosition = arguments.position;
	}

	public void function setStartTagEndPosition(position) {
		variables.startTagEndPosition = arguments.position;
	}

	public function getStartTagEndPosition() {
		return variables.startTagEndPosition;
	}

	public function getEndTagStartPosition() {
		return variables.endTagStartPosition;
	}

	public boolean function isCustomTag() {
		return lCase(left(getName(), 3)) == "cf_";
	}

	public boolean function couldHaveInnerContent() {
		if (isCustomTag()) {
			//custom tag assume true
			return true;
		}
		return listFindNoCase("cfoutput,cfmail,cfsavecontent,cfquery,cfdocument,cfpdf,cfhtmltopdf,cfhtmltopdfitem,cfscript,cfform,cfloop,cfif,cfelse,cfelseif,cftry,cfcatch,cffinally,cfstoredproc,cfswitch,cfcase,cfdefaultcase,cfcomponent,cffunction,cfchart,cfclient,cfdiv,cfdocumentitem,cfdocumentsection,cfformgroup,cfgrid,cfhttp,cfimap,cfinterface,cfinvoke,cflayout,cflock,cflogin,cfmap,cfmenu,cfmodule,cfpod,cfpresentation,cfthread,cfreport,cfsilent,cftable,cftextarea,cftimer,cftransaction,cftree,cfzip,cfwindow,cfxml", getName());
	}

	public string function getAttributeContent() {
		if (!structKeyExists(variables, "attributeContent")) {
			if (getStartTagEndPosition() == 0 || getStartPosition() == 0 || getStartPosition() >= getStartTagEndPosition()) {
				throw(message="Unable to getAttributeContent for tag: #getName()# startPosition:#getStartPosition()# startTagEndPosition:#getStartTagEndPosition()#");
			} else if (!hasAttributes()) {
				//tag with no attributes determined by length, skip mid operation
				variables.attributeContent = "";
			} else {
				variables.attributeContent = mid(getFile().getFileContent(), getStartPosition()+1, getStartTagEndPosition()-getStartPosition()-1);
				variables.attributeContent = reReplace(variables.attributeContent, "^[[:space:]]*" & getName(), "");
			}
			
		}
		return variables.attributeContent;
	}

	public boolean function hasAttributes() {
		return getStartTagEndPosition()-getStartPosition() != len(getName()) + 1;
	}

	public boolean function hasInnerContent() {
		return (getStartTagEndPosition()+1 < getEndTagStartPosition());
	}

	public boolean function isInnerContentEvaluated() {
		return listFindNoCase("cfoutput,cfquery,cfmail", getName());
	}

	public string function getInnerContent() {
		if (!hasInnerContent()) {
			return "";
		} else {
			return mid(getFile().getFileContent(), getStartTagEndPosition()+1, getEndTagStartPosition()-getStartTagEndPosition()-1);
		}
	}





	public struct function getAttributes() {
		var attributeName = "";
		var attributeValue = "";
		var mode = "new";
		var quotedValue = "";
		var c = "";
		var i = "";
		var inPound = false;
		var parenStack = 0;
		var bracketStack = 0;
		var inExpr = false;
		var exp = false;
		var e = "";
		if (structKeyExists(variables, "attributeStruct")) {
			return variables.attributeStruct;
		}
		variables.attributeStruct = StructNew();
		if (hasAttributes()) {
			if (!structKeyExists(variables, "attributeContent")) {
				getAttributeContent();	
			}
			for (i=1;i<=len(variables.attributeContent);i++) {
				c = mid(variables.attributeContent, i, 1);
				if (c IS "##") {
					if (!inExpr && i < len(variables.attributeContent) && mid(variables.attributeContent, i+1, 1) != "##") {
						// not in expr and next char is not pound
						inExpr = true;
						parenStack = 0;
						bracketStack = 0;
					}
					else if (inExpr && parenStack == 0 && bracketStack == 0) {
						//end of expr
						inExpr = false;
					}
					inPound = !inPound;
					if (mode == "attributeValueStart") {
						mode = "attributeValue";
						attributeValue = c;
					}
					else if (mode == "attributeValue") {
						attributeValue = attributeValue & c;
					}	
				}
				else if (c == "(" && inExpr && mode == "attributeValue") {
					parenStack = parenStack+1;
					attributeValue = attributeValue & c;
				}
				else if (c == ")" && inExpr && mode == "attributeValue") {
					parenStack = parenStack-1;
					attributeValue = attributeValue & c;
				}
				else if ( c IS "[" AND inExpr AND mode IS "attributeValue" ) {
					bracketStack = bracketStack+1;
					attributeValue = attributeValue & c;
				}
				else if ( c IS "]" AND inExpr AND mode IS "attributeValue" ) {
					bracketStack = bracketStack-1;
					attributeValue = attributeValue & c;
				}
				else if ( c IS "=" AND NOT inPound ) {
					mode = "attributeValueStart";
					quotedValue = "";
				}
				else if ( reFind("\s", c) ) {
					//whitespace
					if (mode IS "attributeName") {
						//a single attribute with no value
						if (len(attributeName)) {
							variables.attributeStruct[attributeName] = "";
							//reset for next attribute
							attributeName = "";
							mode = "new";
							attributeValue = "";
						}
					}
					else if (mode IS "attributeValue") {
						if (quotedValue EQ "" AND bracketStack EQ 0 AND parenStack EQ 0) {
							//end of unquoted expr value
							variables.attributeStruct[attributeName] = attributeValue;
							e = {expression=attributeValue, position=0};
							e.position = getStartPosition() + len(getName()) + i - len(attributeValue) + e.position;
							arrayAppend(variables.attributeExpressions, e);
							attributeName = "";
							mode = "new";
							attributeValue = "";
							inExpr = false;
						} else {
							attributeValue = attributeValue & c;
						}
					}
				}
				else if (c IS """" OR c IS "'") {
					//quote
					if (mode == "attributeValueStart") {
						quotedValue = c;
						mode = "attributeValue";
					} else if (mode IS "attributeValue") {
						if (c IS quotedValue AND NOT inExpr) {
							//end of attribute reached
							variables.attributeStruct[attributeName] = attributeValue;
							exp = getExpressionsFromString(attributeValue);
							for (e in exp) {
								e.position = getStartPosition() + len(getName()) + i - len(attributeValue) + e.position;
								arrayAppend(variables.attributeExpressions, e);
							}
							//reset for next attribute
							attributeName = "";
							mode = "new";
							attributeValue = "";
						} else {
							attributeValue = attributeValue & c;
						}

					}
				}
				else if (mode == "new") {
					//a new attribute is about to start
					attributeName = c;
					mode = "attributeName";

				}
				else if (mode == "attributeName") {
					attributeName = attributeName & c;
				}
				else if (mode == "attributeValueStart") {
					//new attribute starting as unquoted expression foo=boo()
					attributeValue = c;
					mode = "attributeValue";
					quotedValue = "";
					inExpr = true;
					parenStack = 0;
					bracketStack = 0;
				}
				else if (mode == "attributeValue") {
					attributeValue = attributeValue & c;
				}
			}
			if (len(attributeName) && len(attributeValue)) {
				if (quotedValue == "" && bracketStack == 0 && parenStack == 0) {
					//end of unquoted expr value
					variables.attributeStruct[attributeName] = attributeValue;
					e = {expression=attributeValue, position=0};
					e.position = e.position + getStartPosition() + len(getName()) + (len(variables.attributeContent)- len(attributeValue));
					arrayAppend(variables.attributeExpressions, e);
				}
			}
			
		}

		return variables.attributeStruct;
	}

	public function getExpressionsFromString(str) {
		return [];
	}


}