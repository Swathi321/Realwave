let reg = {
  mobileValidation: /^(\+\d{1,3}[- ]?)?\d{10}$/,
  passwordValidation: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/,
  tenDigitNumberValidation: /^[0-9]{10}$/,
  fiveDigitZipValidation: /^[0-9]{5}$/,
  emailValidation: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  Time24HrValidation: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
}
export default reg;
