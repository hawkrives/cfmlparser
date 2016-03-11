component {
	variables.fileContent = "";
	variables.filePath = "";
	variables.parser = "";
	variables.isScript = false;
	variables.fileLength = 0;

	function init(string filePath="", string fileContent="") {
		if (len(arguments.fileContent) == 0 && len(arguments.filePath) > 0) {
			variables.fileContent = fileRead(filePath);
		} else {
			variables.fileContent = arguments.fileContent;
		}
		variables.filePath = arguments.filePath;
		variables.fileLength = len(variables.fileContent);
		if (reFind("component[^>]*{", arguments.fileContent)) {
			//script cfc
			variables.isScript = true;
		} else {
			//tag based file
			variables.parser = new TagParser();
			variables.parser.parse(this);
		}

	}

	function getFileContent() {
		return variables.fileContent;
	}

	function getFileLength() {
		return variables.fileLength;
	}

	function getParser() {
		return variables.parser;
	}

	function getStatements() {
		return getParser().getStatements();
	}

	boolean function isScript() {
		return variables.isScript;
	}

}