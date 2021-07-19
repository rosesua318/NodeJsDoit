const echo = (params, callback) => {
  console.log("echo 호출됨.");
  console.log("PARAMS -> " + JSON.stringify(params));

  callback(null, params);
};

module.exports = echo;
