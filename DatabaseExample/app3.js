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

// mongoose 모듈 사용
var mongoose = require("mongoose");

var database;
var UserSchema;
var UserModel;

// db 연결 함수
var connectDB = () => {
  var databaseUrl = "mongodb://localhost:27017/local";

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  // 데이터베이스가 연결됐을 때 실행되는 이벤트
  database.on("open", () => {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    UserSchema = mongoose.Schema({
      id: String,
      name: String,
      password: String,
    });
    console.log("UserSchema 정의함.");

    UserModel = mongoose.model("users", UserSchema); // 스키마와 실제 컬렉션 이름을 users로 해서 연결해줌
    console.log("UserModel 정의함");
  });

  // 데이터베이스 연결이 끊어졌을 때 실행되는 이벤트
  database.on("disconnected", () => {
    console.log("데이터베이스 연결 끊어짐.");
  });

  // 데이터베이스에 에러가 생겼을 때 실행되는 이벤트
  database.on("error", console.error.bind(console, "mongoose 연결 에러."));
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
    authUser(database, paramId, paramPassword, (err, docs) => {
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

router.route("/process/addUser").post((req, res) => {
  console.log("/process/addUser 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;

  console.log(
    "요청 파라미터 : " + paramId + ", " + paramPassword + ", " + paramName
  );

  if (database) {
    addUser(database, paramId, paramPassword, paramName, (err, result) => {
      if (err) {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }

      if (result) {
        console.dir(result);

        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 추가 성공</h1>");
        res.write("<div><p>사용자 : " + paramName + "</p></div>");
        res.end();
        return;
      } else {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 추가 안됨./h1>");
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

var authUser = (db, id, password, callback) => {
  console.log("authUser 호출됨 : " + id + ", " + password);

  UserModel.find({ id: id, password: password }, (err, docs) => {
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

var addUser = (db, id, password, name, callback) => {
  console.log("addUser 호출됨 : " + id + ", " + password + ", " + name);

  var user = new UserModel({ id: id, password: password, name: name });

  user.save((err) => {
    if (err) {
      callback(err, null);
      return;
    }

    console.log("사용자 데이터 추가함.");
    callback(null, user);
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

  connectDB();
});
