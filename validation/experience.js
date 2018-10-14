const validator = require("validator");
const isEmpty = require("./isEmpty");
module.exports = function validateExperienceInput(data) {
  let errors = {};
  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";
  if (validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }
  if (validator.isEmpty(data.company)) {
    errors.company = "Company is required";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "From data is required";
  }
  return {
    isValid: isEmpty(errors),
    errors
  };
};
