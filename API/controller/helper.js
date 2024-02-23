module.exports.APIReturn = function (code = 0, data = {}, msg = "") {
  if (code === 503) {
    code = 10;
    if (msg !== "") msg = "Miss field";
  }
  if (typeof data === "string") {
    msg = data;
    data = "";
  }
  return {
    code,
    data,
    msg,
  };
};
