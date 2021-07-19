const add = (params, callback) => {
  console.log("RPC - add 호출됨.");
  console.log("PARAMS -> " + JSON.stringify(params));

  var a = params[0];
  var b = params[1];
  var output = a + b;

  callback(null, output);
};

module.exports = add;
