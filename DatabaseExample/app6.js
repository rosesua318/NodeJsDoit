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

// mysql 모듈 사용
var mysql = require("mysql");

// 새로운 pool 생성
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "zigzag1234",
  database: "test",
  debug: false,
});

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

router.route("/process/adduser").post((req, res) => {
  console.log("/process/adduser 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;
  var paramAge = req.body.age || req.query.age;

  console.log(
    "요청 파라미터 : " +
      paramId +
      ", " +
      paramPassword +
      ", " +
      paramName +
      ", " +
      paramAge
  );

  var age = Number(paramAge);

  addUser(paramId, paramName, age, paramPassword, (err, addedUser) => {
    if (err) {
      console.log("에러 발생.");
      res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>에러 발생</h1>");
      res.end();
      return;
    }

    if (addedUser) {
      console.dir(addedUser);

      res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>사용자 추가 성공</h1>");
      res.end();
      return;
    } else {
      console.log("에러 발생.");
      res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>사용자 추가 실패./h1>");
      res.end();
      return;
    }
  });
});

router.route("/process/login").post((req, res) => {
  console.log("/process/login 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

  authUser(paramId, paramPassword, (err, rows) => {
    if (err) {
      console.log("에러 발생.");
      res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>에러 발생</h1>");
      res.end();
      return;
    }

    if (rows) {
      console.dir(rows);

      res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>사용자 로그인 성공</h1>");
      res.write("<div><p>사용자 : " + rows[0].name + "</p></div>");
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
});

app.use("/", router); // 라우팅 함수 등록

var addUser = (id, name, age, password, callback) => {
  console.log("addUser 호출됨.");

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release(); // connection을 pool에 반납
      }
      callback(err, null);
      return;
    }
    console.log("데이터베이스 연결의 스레드 아이디 : " + conn.threadId);

    var data = { id: id, name: name, age: age, password: password };
    var exec = conn.query("insert into users set ?", data, (err, result) => {
      conn.release();
      console.log("실행된 SQL : " + exec.sql);

      if (err) {
        console.log("SQL 실행 시 에러 발생");
        callback(err, null);
        return;
      }

      callback(null, result);
    });
  });
};

var authUser = (id, password, callback) => {
  console.log("authUser 호출됨 : " + id + ", " + password);

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release();
      }

      callback(err, null);
      return;
    }

    console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

    var tablename = "users";
    var columns = ["id", "name", "age"];
    var exec = conn.query(
      "select ?? from ?? where id = ? and password = ?",
      [columns, tablename, id, password],
      (err, rows) => {
        conn.release();
        console.log("실행된 SQL : " + exec.sql);

        if (err) {
          callback(err, null);
          return;
        }

        if (rows.length > 0) {
          console.log("사용자 찾음.");
          callback(null, rows);
        } else {
          console.log("사용자 찾지 못함.");
          callback(null, null);
        }
      }
    );
  });
};

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
});
