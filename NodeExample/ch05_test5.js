var http = require("http");
var options = {
  host: "www.google.com",
  port: 80,
  path: "/",
};
var resData = "";
var req = http.request(options, (res) => {
  res.on("data", (chunk) => {
    resData += chunk;
  });
  res.on("end", () => {
    console.log(resData);
  });
});
