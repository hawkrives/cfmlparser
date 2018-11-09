const fs = require("fs");

global.len = str => {
	return str.length;
};

global.arrayLen = arr => {
	return arr.length;
};

global.mid = (str, start, end) => {
	return str.substr(start + 1, end + 1);
};
global.Mid = global.mid;

global.left = (str, start, end) => {
	return str.substr(start + 1, end + 1);
};

global.fileRead = name => {
	return fs.readFileSync(name, "utf-8");
};

global.chr = code => {
	return String.fromCharCode(code);
};
global.Chr = global.chr;

global.listFindNoCase = (lst, needle, delimiter = ",") => {
	lst = lst.toLowerCase();
	needle = needle.toLowerCase();
	let split = lst.split(delimiter);
	return split.includes(needle);
};

global.isSimpleValue = val => {
	if (typeof val === "string") {
		return true;
	}
	if (typeof val === "number") {
		return true;
	}
	if (typeof val === "boolean") {
		return true;
	}
	return false;
};

global.reFindNoCase = (
	regexp,
	haystack,
	start = 1,
	subexprs = false,
	scope = "one"
) => {
	if (subexprs) {
		throw new Error("not implemented");
	}
	if (scope === "all") {
		throw new Error("not implemented");
	}
	if (!(regexp instanceof RegExp)) {
		throw new Error("regex must be a RegExp");
	}
	regexp = new RegExp(regexp);
	regexp.ignoreCase = true;
	regexp.lastIndex = start - 1;
	let match = regexp.exec(haystack);
	return match.index === null ? 0 : match.index + 1;
};

global.reFind = (
	regexp,
	haystack,
	start = 1,
	subexprs = false,
	scope = "one"
) => {
	if (subexprs) {
		throw new Error("not implemented");
	}
	if (scope === "all") {
		throw new Error("not implemented");
	}
	if (!(regexp instanceof RegExp)) {
		throw new Error("regex must be a RegExp");
	}
	regexp = new RegExp(regexp);
	regexp.lastIndex = start - 1;
	let match = regexp.exec(haystack);
	return match.index === null ? 0 : match.index + 1;
};

global.find = (substr, haystack, start = 1) => {
	let index = haystack.indexOf(substr, start - 1);
	return index === -1 ? 0 : index + 1;
};

global.arrayAppend = (arr, item) => {
	arr.push(item);
};

// global.replace = (str, needle, replacement, scope = "one") => {
// 	if (scope === "all") {
// 		needle = new RegExp(needle);
// 		needle.global = true;
// 	}
// 	return str.replace(needle, replacement);
// };
