const Statement = require("./statement");

module.exports = class Comment extends Statement {
  isComment() {
    return true;
  }

  getComment() {
    var text = this.getText();
    if (this.getName() === "!---") {
      text = text.replace(/<!---|--->/g, "");
    }
    return text;
  }
};
