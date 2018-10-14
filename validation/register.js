const validator = require("validator");
const isEmpty = require("./isEmpty");
module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters";
  }
  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }
  if (!validator.isEmail(data.email)) {
    errors.email = "Invalid email";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (!validator.isLength(data.password, { min: 6, max: 32 })) {
    errors.password = " Password should be at least 6 letters";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Password must match";
  }
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password is required";
  }
  return {
    isValid: isEmpty(errors),
    errors
  };
};
