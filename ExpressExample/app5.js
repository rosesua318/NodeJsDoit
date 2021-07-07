var express = require("express");
var http = require("http");

var app = express();

app.set("port", process.env.PORT || 3000);

app.use((req, res, next) => {
  console.log("첫번째 미들웨어 호출됨.");

  res.redirect("http://google.co.kr"); // 구글 페이지로 이동
}); // 미들웨어 등록

var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));
});
