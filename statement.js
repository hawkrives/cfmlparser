module.exports = class Statement {
	constructor() {
		this.name = "";
		this.startPosition = 0;
		this.hasParent = false;
		this.parent = "";
		this.children = [];
		this.endPosition = 0;
		this.file = "";
	}

	init({ name, startPosition, file, parent = "" }) {
		this.name = name;
		this.startPosition = startPosition;
		this.file = file;
		if (!isSimpleValue(parent)) {
			this.hasParent = true;
			this.parent = parent;
		}
		return this;
	}

	addChild(child) {
		this.children.push(child);
	}

	getExpressions() {
		return [];
	}

	getName() {
		return this.name;
	}

	getStartPosition() {
		return this.startPosition;
	}

	isTag() {
		return false;
	}

	isComment() {
		return false;
	}

	isFunction() {
		return false;
	}

	hasParent() {
		return this.hasParent;
	}

	getParent() {
		return this.parent;
	}

	setEndPosition(position) {
		this.endPosition = position;
	}

	getEndPosition() {
		return this.endPosition;
	}

	getFile() {
		return this.file;
	}

	getText() {
		if (
			this.endPosition === 0 ||
			this.startPosition === 0 ||
			this.startPosition >= this.endPosition
		) {
			return "";
		}

		return mid(
			fileRead(this.getFile()),
			this.startPosition,
			this.endPosition - this.startPosition + 1
		);
	}

	getChildren() {
		return this.children;
	}

	hasChildren() {
		return arrayLen(this.children) > 0;
	}

	/* for debugging */
	// TODO(rives): implement this
	getVariables() {
		var rtn = {};
		var key = "";
		for (key in structKeyList(this)) {
			if (isSimpleValue(this[key])) {
				rtn[key] = this[key];
			}
		}
		return rtn;
	}
};
