component  {
	variables.animal = "chicken";

	public function getSound() {
		var sound = "";
		if (variables.animal == "chicken") {
			sound = "cluck";
		} else if (variables.animal == "cow") {
			sound = "moo";
		}
		return sound;
	}
}