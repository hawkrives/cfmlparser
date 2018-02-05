component extends="BaseTest" {

    function testVarStatements() {
        var parser = getParser("script/basic.cfc");
        var statements = parser.getStatements();
        var stmt = "";
        debug(statements);
        debug(statements.map( function( st ) { return st.getName() & "—" & st.getText(); } ) );
        debug(statements.map( function( st ) { return st.getVariables(); } ) );

        $assert.isTrue(parser.isScript(), "should be script parser");
        $assert.isTrue(arrayLen(statements) > 0, "Should have statements");

        stmt = statements[1];
        $assert.isEqual("component", stmt.getName(), "Name should be component");
        $assert.isEqual(1, stmt.getStartPosition(), "Should start at 1");
        $assert.isEqual(11, stmt.getBodyOpen(), "Should open at 11, #serializeJSON(stmt.getVariables())#");
        $assert.isEqual(80, stmt.getEndPosition(), "Should end at 80");

        stmt = statements[2];
        $assert.isEqual("function", stmt.getName(), "Name should be function");
        $assert.isEqual(2, arrayLen(stmt.getChildren()), "Function should have two children");

        stmt = statements[3];
        $assert.isEqual("var", stmt.getName(), "Name should be var");
        $assert.isEqual('var sound = "";', stmt.getText());
    }

}