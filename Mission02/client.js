// net 모듈 : 서버와 클라이언트 만드는 방법 제공
var net = require("net");

var hostname = "localhost";
var port = 3000;

// 서버에 연결
var client = new net.Socket();
client.connect(port, hostname, () => {
  console.log("서버에 연결 -> " + hostname + ":" + port);
  client.write("Hi");
});

// 서버로부터 데이터 받았을 때 발생하는 이벤트
client.on("data", (data) => {
  console.log("서버로부터 받은 데이터 : " + data);
  client.destroy(); // 클라이언트 연결 종료
});

client.on("close", () => {
  console.log("연결 끊어짐.");
});
