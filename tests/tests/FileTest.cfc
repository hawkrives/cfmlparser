component extends="BaseTest" {

	
	function testGetFileLength() {
		var f = new cfmlparser.File(fileContent="Hello");

		$assert.isEqual(5, f.getFileLength());
		
	}

	function testGetFileContent() {
		var f = new cfmlparser.File(fileContent="Hello");

		$assert.isEqual("Hello", f.getFileContent());
		
	}

	function testGetFileLengthFromFile() {
		var f = getFile("tag/hello.cfm");

		$assert.isEqual(5, f.getFileLength());
		
	}

	function testGetFileContentFromFile() {
		var f = getFile("tag/hello.cfm");

		$assert.isEqual("Hello", f.getFileContent());
		
	}


	

}