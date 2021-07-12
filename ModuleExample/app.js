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

var user = require("./routes/user");

// 암호화 모듈
var crypto = require("crypto");

// mongoose 모듈 사용
var mongoose = require("mongoose");

var database;
var UserSchema;
var UserModel;

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

// db 연결 함수
var connectDB = () => {
  var databaseUrl = "mongodb://localhost:27017/local";

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  // 데이터베이스가 연결됐을 때 실행되는 이벤트
  database.on("open", () => {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    createUserSchema(database);
  });

  // 데이터베이스 연결이 끊어졌을 때 실행되는 이벤트
  database.on("disconnected", () => {
    console.log("데이터베이스 연결 끊어짐.");
  });

  // 데이터베이스에 에러가 생겼을 때 실행되는 이벤트
  database.on("error", console.error.bind(console, "mongoose 연결 에러."));

  app.set("database", database);
};

var createUserSchema = (database) => {
  /*
      var user_schema = require('./database/user_schema');
      var UserSchema = user_schema.createSchema();
      */

  database.UserSchema = require("./database/user_schema").createSchema(
    mongoose
  );

  database.UserModel = mongoose.model("users3", database.UserSchema); // 스키마와 실제 컬렉션 이름을 users로 해서 연결해줌
  console.log("UserModel 정의함");
};

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

router.route("/process/login").post(user.login);

router.route("/process/addUser").post(user.addUser);

router.route("/process/listuser").post(user.listuser);

app.use("/", router); // 라우팅 함수 등록

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Express 서버 시작
var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));

  connectDB();
});
