var express = require("express");
var http = require("http");

var app = express();

app.set("port", process.env.PORT || 3000);

app.use((req, res, next) => {
  console.log("첫번째 미들웨어 호출됨.");

  req.user = "mike";

  next();
}); // 미들웨어 등록

app.use((req, res, next) => {
  console.log("두번째 미들웨어 호출됨.");

  res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
  res.end("<h1>서버에서 응답한 결과입니다 : " + req.user + "</h1>");
});

var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));
});
