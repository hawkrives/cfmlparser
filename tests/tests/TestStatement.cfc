component extends="BaseTest" {

	
	function testGetText() {
		var parser = getParser("tag/if-else.cfm");
		var statements = parser.getStatements();
		var tag = "";

		tag = statements[2]; //cfoutput
		$assert.isTrue(tag.isTag(), "isTag");
		$assert.isEqual("cfoutput", tag.getName(), "Name should be cfoutput");
		$assert.isEqual("<" & "cfoutput" & ">Hello ##encodeForHTML(url.name)##</" & "cfoutput" & ">", tag.getText());

	}

	

}