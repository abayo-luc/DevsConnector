const validator = require("validator");
const isEmpty = require("./isEmpty");
module.exports = function validateCommentInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";
  if (!validator.isLength(data.text, { min: 2, max: 300 })) {
    errors.text = "Comment should be between 2 and 300 text";
  }
  if (validator.isEmpty(data.text)) {
    errors.text = "Comment text is required";
  }

  return {
    isValid: isEmpty(errors),
    errors
  };
};
