component extends="BaseTest" {

	
	
	function testFunky() {
		var parser = getParser("script/funky.cfc");
		var statements = parser.getStatements();
		var stmt = "";
		
		$assert.isTrue(parser.isScript(), "should be script parser");
		$assert.isTrue(arrayLen(statements) == 8, "Should have 8 statements");

		stmt = statements[1];
		//comment
		$assert.isTrue(stmt.isComment(), "Should start with comment.");

		//component
		stmt = statements[2];
		 
		$assert.isEqual("component", stmt.getName(), "Name should be component");
		
		$assert.isTrue(arrayLen(stmt.getChildren()) == 2, "component should have 2 children");

		

		stmt = statements[3];
		$assert.isEqual("function", stmt.getName(), "Name should be function. stmt:#serializeJSON(stmt.getVariables())#");

		
		$assert.isTrue(stmt.isFunction(), "isFunction should be true");

		stmt = statements[4];
		$assert.isEqual("if", stmt.getName(), "Name should be if. stmt:#serializeJSON(stmt.getVariables())#");

		stmt = statements[5];
		$assert.isEqual("statement", stmt.getName(), "Name should be statement. stmt:#serializeJSON(stmt.getVariables())#");

		$assert.isEqual("if", stmt.getParent().getName(), "Parent should be if.");

		stmt = statements[6];

		$assert.isEqual("else", stmt.getName(), "Name should be else. stmt:#serializeJSON(stmt.getVariables())#");	

		$assert.isEqual("function", stmt.getParent().getName(), "Parent should be function.");
		
		

		
	}

	

}