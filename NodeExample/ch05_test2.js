var http = require("http");

var server = http.createServer();

var host = "192.192.0.33";
var port = 3000;
server.listen(port, host, 50000, () => {
  console.log("웹서버 실행됨.");
});

server.on("connection", (socket) => {
  var addr = socket.address();
  console.log("클라이언트가 접속했습니다.: %s, %d", addr.address, addr.port);
});

server.on("request", (req, res) => {
  console.log("클라이언트 요청이 들어왔습니다.");
  //console.dir(req);
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.write("<h1>웹서버로부터 받은 응답</h1>");
  res.end();
});
