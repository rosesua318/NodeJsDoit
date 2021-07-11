// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var static = require("serve-static");
var path = require("path");

// Express의 미들웨어 불러오기
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");

// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// mongodb 모듈 사용
var MongoClient = require("mongodb").MongoClient;

var database;

// db 연결 함수
var connectDB = () => {
  var databaseUrl = "mongodb://localhost:27017/local";

  MongoClient.connect(databaseUrl, (err, db) => {
    if (err) {
      console.log("데이터베이스 연결 시 에러 발생함.");
      return;
    }

    console.log("데이터베이스에 연결됨 : " + databaseUrl);
    database = db.db("local");
  });
};

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);
app.use("/public", static(path.join(__dirname, "public")));

// POST방식의 요청 파라미터 처리하기 위함
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

router.route("/process/login").post((req, res) => {
  console.log("/process/login 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

  if (database) {
    authoUser(database, paramId, paramPassword, (err, docs) => {
      if (err) {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }

      if (docs) {
        console.dir(docs);

        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 로그인 성공</h1>");
        res.write("<div><p>사용자 : " + docs[0].name + "</p></div>");
        res.write('<br><br><a href="/public/login.html">다시 로그인하기</a>');
        res.end();
        return;
      } else {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 데이터 조회 안됨./h1>");
        res.end();
        return;
      }
    });
  } else {
    console.log("에러 발생.");
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결 안됨./h1>");
    res.end();
    return;
  }
});

app.use("/", router); // 라우팅 함수 등록

var authoUser = (db, id, password, callback) => {
  console.log("authUser 호출됨 : " + id + ", " + password);

  var users = db.collection("users");

  users.find({ id: id, password: password }).toArray((err, docs) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (docs.length > 0) {
      console.log("일치하는 사용자를 찾음.");
      callback(null, docs);
    } else {
      console.log("일치하는 사용자를 찾지 못함.");
      callback(null, null);
    }
  });
};

/*
// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all("*", (req, res) => {
  res.status(404).send("<h1>요청하신 페이지는 없어요.</h1>");
});
*/

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Express 서버 시작
var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));

  connectDB();
});
