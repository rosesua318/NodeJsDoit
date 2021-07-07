var http = require("http");

var server = http.createServer(); // 웹 서버 객체 생성

var host = "192.192.0.33";
var port = 3000;
server.listen(port, host, "50000", () => {
  console.log("웹서버가 실행되었습니다 -> " + host + ":" + port);
}); // 대기
