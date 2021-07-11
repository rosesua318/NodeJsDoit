var express = require("express");
var http = require("http");
var static = require("serve-static");
var path = require("path");

var bodyParser = require("body-parser");

var app = express();

app.set("port", process.env.PORT || 3000);
app.use("/public", static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var router = express.Router();

router.route("/process/login/:name").post((req, res) => {
  // 해당 요청 패스로 들어온 것만 받음
  console.log("/process/login/:name 라우팅 함수에서 받음");

  var paramName = req.params.name; // URL 파라미터 사용

  var paramId = req.body.id || req.query.id; // POST방식 또는 GET 방식
  var paramPassword = req.body.password || req.query.password;

  res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
  res.write("<h1>서버에서 로그인 응답</h1>");
  res.write("<div><p>" + paramName + "</p></div>");
  res.write("<div><p>" + paramId + "</p></div>");
  res.write("<div><p>" + paramPassword + "</p></div>");
  res.end();
});

app.use("/", router); // 라우팅 함수 등록

/* 라우팅으로 처리하였기 때문에 미들웨어 부분은 주석처리함
app.use((req, res, next) => {
  console.log("첫번째 미들웨어 호출됨.");

  var userAgent = req.header("User-Agent");
  var paramId = req.body.id || req.query.id;

  res.send(
    "<h3>서버에서 응답. User-Agent -> " +
      userAgent +
      "</h3><h3>Param Name -> " +
      paramId +
      "</h3>"
  );
}); // 미들웨어 등록(응답을 보내줌)
*/

var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));
});
