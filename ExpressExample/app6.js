var express = require("express");
var http = require("http");

var app = express();

app.set("port", process.env.PORT || 3000);

app.use((req, res, next) => {
  console.log("첫번째 미들웨어 호출됨.");

  var userAgent = req.header("User-Agent");
  var paramName = req.query.name;

  res.send(
    "<h3>서버에서 응답. User-Agent -> " +
      userAgent +
      "</h3><h3>Param Name -> " +
      paramName +
      "</h3>"
  );
}); // 미들웨어 등록

var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));
});
