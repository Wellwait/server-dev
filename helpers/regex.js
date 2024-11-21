const regexValidations = {
  contactRegex: /^\d{10}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pinCodeRegex: /^\d{6}$/,
  urlRegex: /^(ftp|http|https):\/\/[^ "]+$/,
  dateRegex: /^\d{4}(\/|-)\d{2}(\/|-)\d{2}$/,
  timeSlotRegex: /^([01]\d|2[0-3]):([0-5]\d)$/,
};

function isBoolean(value) {
  return typeof value === "boolean";
}

export { regexValidations, isBoolean };
