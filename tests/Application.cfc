component {
	this.name = "cfmlparser_tests";
	
	this.mappings = { 
		"/cfmlparser" = reReplace(getCurrentTemplatePath(), "tests[\/]Application.cfc", ""),
		"/testbox" = getDirectoryFromPath(getCurrentTemplatePath()) & "testbox",
		"/tests" = getDirectoryFromPath(getCurrentTemplatePath()) & "tests"
	};
}