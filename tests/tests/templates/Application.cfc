component {
	this.name = "cfmlparser_test_templates";

	public boolean function onRequestStart(string template) {
		abort;
		return false;
	}
}