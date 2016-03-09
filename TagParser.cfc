component extends="AbstractParser" {

	public function parse(file) {
		var tagName = "";
		var charPos = 0;
		var spacePos = 0;
		var gtPos = 0;
		var tagNameEndPos = 0;
		var nestedComment = false;
		var startPos = 0;
		var tag = "";
		var c = "";
		var content = arguments.file.getFileContent();
		var contentLength = len(content);
		var ltPos = Find("<", content);
		var endTagPos = 0;
		var nextTagPos = 0;
		var parent = "";

		while (ltPos != 0) {
			charPos = ReFind("[!/a-zA-Z]", content, ltPos+1);
			spacePos = ReFind("[[:space:]]", content, ltPos+1);
			if (charPos > spacePos) {
				//have whitespace before tag name < tag>
				spacePos = ReFind("[[:space:]]", content, charPos+1);
			}
			gtPos = Find(">", content, ltPos);
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
				tagName = LCase( Trim( subString(content, charPos, tagNameEndPos) ) );
				if (left(tagName, 2) == "cf") {
					tag = new Tag(name=tagName, startPosition=ltPos, parent=parent, file=arguments.file);
					tag.setStartTagEndPosition(gtPos);
					addStatement(tag);
					if (!isSimpleValue(parent)) {
						//has a parent, so set as child
						parent.addChild(tag);
					}
					if (tag.couldHaveInnerContent()) {
						endTagPos = reFindNoCase("<[[:space:]]*/[[:space:]]*#reReplace(tagName, "[^[:alnum:]_]", "", "ALL")#[[:space:]]*>", content, gtPos);
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
					charPos = ltPos+4;
					endTagPos = find("--->", content, charPos);
					nestedComment = find("<" & "!---", content, charPos);
					if (nestedComment == 0 || nestedComment > endTagPos) {
						//no nested comments 
						endTagPos = endTagPos+3;
					} else {
						nestedComment = 0;
						while (charPos < contentLength) {
							c = mid(content, charPos,1);
							if (c == "<" && mid(content, charPos, 5) == "<!---") {
								nestedComment = nestedComment + 1;
								charPos = charPos+4;
							} else if (c=="-" && mid(content, charPos, 4) == "--->") {
								nestedComment = nestedComment - 1;
								charPos = charPos+3;
								if (nestedComment == 0) {
									endTagPos = charPos;
									break;
								}
							} else {
								charPos = charPos+1;	
							}
						}
					}
					gtPos = endTagPos;
					tag = new Comment(name="!---", startPosition=ltPos, parent=parent, file=arguments.file);
					tag.setEndPosition(endTagPos);
					addStatement(tag);
				} else if (left(tagName, 3) == "/cf") {
					//end tag
					if (!isSimpleValue(parent)) {
						parent.setEndTagStartPosition(ltPos);
						parent.setEndPosition(gtPos);
						parent = parent.getParent();
					} 
				}	
			}
			ltPos = find("<", content, gtPos);
		}
	}


}