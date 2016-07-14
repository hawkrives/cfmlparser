component extends="BaseTest" {

	function testIfElseTags() {
		var parser = getParser("tag/if-else.cfm");
		var statements = parser.getStatements();
		var tag = "";
		
		$assert.isTrue(isArray(statements), "getStatements returns array");
		$assert.isTrue(arrayLen(statements) == 3, "should have 3 elements: " & serializeJSON(statements));

		//tag 1 cfif
		tag = statements[1];
		$assert.isTrue(tag.isTag(), "isTag");
		$assert.isEqual("cfif", tag.getName(), "Name should be cfif");
		$assert.isEqual(1, tag.getStartPosition());
		$assert.isEqual(35, tag.getStartTagEndPosition());

		//tag 2 cfoutput
		tag = statements[2];
		$assert.isTrue(tag.isTag(), "isTag");
		$assert.isEqual("cfoutput", tag.getName(), "Name should be cfoutput");
		$assert.isEqual(38, tag.getStartPosition());
		//parent should be tag 1
		$assert.isEqual("cfif", tag.getParent().getName());
		$assert.isEqual(1, tag.getParent().getStartPosition());
		$assert.isEqual(35, tag.getParent().getStartTagEndPosition());

		//tag 3 cfelse
		tag = statements[3];
		$assert.isTrue(tag.isTag(), "isTag");
		$assert.isEqual("cfelse", tag.getName(), "Name should be cfelse");

	}

	function testComment() {
		var parser = getParser("tag/cfoutput-comment.cfm");
		var statements = parser.getStatements();
		var tag = "";

		$assert.isTrue(isArray(statements), "getStatements returns array");
		$assert.isTrue(arrayLen(statements) == 2, "should have 2 elements: " & serializeJSON(statements));

		tag = statements[1]; //cfoutput
		$assert.isTrue(tag.isTag(), "isTag");
		$assert.isEqual("cfoutput", tag.getName(), "Name should be cfoutput");

		tag = statements[2]; //comment
		$assert.isTrue(tag.isComment(), "isComment");
		$assert.isEqual("!---", tag.getName());
		$assert.isEqual(" here is a comment ", tag.getComment());

	}

	function testGtInTag() {
		var parser = getParser("tag/gt-in-tag.cfm");
		var statements = parser.getStatements();
		var tag = statements[1];

		$assert.isEqual(" hasGt =  find("">"", str)", tag.getAttributeContent());

	}

	function testGtInTagAttribute() {
		var parser = getParser("tag/gt-in-tag.cfm");
		var statements = parser.getStatements();
		var tag = statements[2];

		$assert.isEqual(" var=""##find('>',str)##""", tag.getAttributeContent());

	}

	function testCFTagInHTML() {
		var parser = getParser("tag/cftag-in-html.cfm");
		var statements = parser.getStatements();
		

		$assert.isTrue(arrayLen(statements) == 1);

	}

	function testGtInTagAttributeWithSameQuotes() {
		var parser = getParser("tag/gt-in-tag.cfm");
		var statements = parser.getStatements();
		var tag = statements[3];

		$assert.isEqual(" var=""##find("">"",str)##""", tag.getAttributeContent());

	}

	function testGetTagEndPosition() {
		var tp = new cfmlparser.TagParser();
		var tag = "<" & "cfabort" & "> foo";
		$assert.isEqual(9, tp.getTagEndPosition(tag, len(tag), 1));


	}

	function testGetTagEndPositionPound() {
		var tp = new cfmlparser.TagParser();
		var tag = "<" & "cfif c IS ""####""" & "> foo";
		$assert.isEqual(16, tp.getTagEndPosition(tag, len(tag), 1));

	}

	function testGetTagEndPositionParserPound() {
		var parser = getParser("tag/tag-end-test.cfm");
		var statements = parser.getStatements();
		var tag = statements[1];
		$assert.isEqual(16, tag.getStartTagEndPosition());
	}

	private function getParser(string template) {
		return getFile(arguments.template).getParser();
	}

}