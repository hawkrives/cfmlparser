component extends="testbox.system.BaseSpec" {

	public function getFile(string path) {
		return new cfmlparser.File(getTemplateDirectory() & arguments.path);
	}

	public function getTemplateDirectory() {
		return getDirectoryFromPath(GetCurrentTemplatePath()) & "templates/";
	}

	private function getParser(string path) {
		return getFile(arguments.path).getParser();
	}

}