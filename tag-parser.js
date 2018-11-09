const AbstractParser = require("./abstract-parser");
const Tag = require("./tag");
const Comment = require("./comment");

module.exports = class TagParser extends AbstractParser {
	parse(file) {
		var tagName = "";
		var charPos = 0;
		var spacePos = 0;
		var gtPos = 0;
		var tagNameEndPos = 0;
		var nestedComment = false;
		var startPos = 0;
		var tag = "";
		var c = "";
		var content = fileRead(file);
		var contentLength = content.length;
		var ltPos = find("<", content);
		var endTagPos = 0;
		var nextTagPos = 0;
		var parent = "";

		while (ltPos != 0) {
			charPos = reFind(/[!/a-zA-Z]/, content, ltPos + 1);
			spacePos = reFind(/\\s/, content, ltPos + 1);
			if (charPos > spacePos) {
				//have whitespace before tag name < tag>
				spacePos = reFind(/\\s/, content, charPos + 1);
			}
			gtPos = this.getTagEndPosition(content, contentLength, ltPos + 1);
			if (gtPos == 0) {
				//invalid tag
				break;
			}
			tagNameEndPos = gtPos;
			if (spacePos != 0 && spacePos < gtPos) {
				tagNameEndPos = spacePos;
			}
			if (charPos > tagNameEndPos) {
				//ignore this case non alpha tag
			} else {
				tagName = this.subString(content, charPos, tagNameEndPos)
					.trim()
					.toLowerCase();

				if (left(tagName, 2) == "cf") {
					tag = new Tag({
						name: tagName,
						startPosition: ltPos,
						parent: parent,
						file: file
					});
					tag.setStartTagEndPosition(gtPos);
					this.addStatement(tag);

					if (!isSimpleValue(parent)) {
						//has a parent, so set as child
						parent.addChild(tag);
					}

					if (tag.couldHaveInnerContent()) {
						let cleanedTagName = tagName.replace(/[^A-Za-z0-9_]/g, "");
						let endTagRegex = new RegExp(`<s*/s*${cleanedTagName}s*>`, "i");
						endTagPos = reFind(endTagRegex, content, gtPos - 1);

						if (endTagPos != 0) {
							parent = tag;
						} else {
							tag.setEndPosition(gtPos);
						}
					} else {
						tag.setEndPosition(gtPos);
					}
				} else if (left(tagName, 4) == "!---") {
					//CFML comment
					charPos = ltPos + 4;
					endTagPos = find("--->", content, charPos);
					nestedComment = find("<" + "!---", content, charPos);
					if (nestedComment == 0 || nestedComment > endTagPos) {
						//no nested comments
						endTagPos = endTagPos + 3;
					} else {
						nestedComment = 0;
						while (charPos < contentLength) {
							c = mid(content, charPos, 1);
							if (c == "<" && mid(content, charPos, 5) == "<!---") {
								nestedComment = nestedComment + 1;
								charPos = charPos + 4;
							} else if (c == "-" && mid(content, charPos, 4) == "--->") {
								nestedComment = nestedComment - 1;
								charPos = charPos + 3;
								if (nestedComment == 0) {
									endTagPos = charPos;
									break;
								}
							} else {
								charPos = charPos + 1;
							}
						}
					}
					gtPos = endTagPos;

					tag = new Comment({
						name: "!---",
						startPosition: ltPos,
						parent: parent,
						file: file
					});
					tag.setEndPosition(endTagPos);
					this.addStatement(tag);
				} else if (left(tagName, 3) == "/cf") {
					//end tag
					if (!isSimpleValue(parent)) {
						parent.setEndTagStartPosition(ltPos);
						parent.setEndPosition(gtPos);
						parent = parent.getParent();
					}
				} else {
					//not a CFML tag
					gtPos = ltPos + 1;
				}
			}
			ltPos = find("<", content, gtPos);
		}
	}

	getTagEndPosition(content, contentLength, startPosition) {
		var pos = startPosition;
		var c = "";
		var inDouble = false;
		var inSingle = false;
		var inPound = false;
		if (startPosition >= contentLength) {
			return contentLength;
		}
		while (pos < contentLength) {
			c = mid(content, pos, 1);
			if (!inSingle && c == '"') {
				if (inDouble && mid(content, pos + 1, 1) == '"') {
					pos = pos + 2;
					continue;
				}
				inDouble = !inDouble;
			} else if (!inDouble && c == "'") {
				if (inSingle && mid(content, pos + 1, 1) == "'") {
					pos = pos + 2;
					continue;
				}
				inSingle = !inSingle;
			} else if (c == "#") {
				//if next char is also a pound then it is escaped so ignore it
				if (mid(content, pos + 1, 1) != "#") {
					inPound = !inPound;
				} else {
					pos = pos + 2;
					continue;
				}
			} else if (c == ">" && !inSingle && !inDouble && !inPound) {
				return pos;
			}
			pos = pos + 1;
		}
		return pos;
	}
};
