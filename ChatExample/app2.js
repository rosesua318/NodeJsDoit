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

var config = require("./config/config");

var database_loader = require("./database/database_loader");
var route_loader = require("./routes/route_loader");

// 암호화 모듈
var crypto = require("crypto");

//==== socket.io 사용 ====//
var socketio = require("socket.io");
var cors = require("cors");

//==== Passport 사용 ====//
var passport = require("passport");
var flash = require("connect-flash");

// 익스프레스 객체 생성
var app = express();

// 뷰 엔진 설정
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
//app.set("view engine", "pug");

// 기본 속성 설정
console.log("config.server_port -> " + config.server_port);
app.set("port", config.server_port || 3000);
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

//==== cors 초기화 ====//
app.use(cors());

//==== Passport 초기화 ====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var configPassport = require("./config/passport");
configPassport(app, passport);

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();
route_loader.init(app, router);

var userPassport = require("./routes/user_passport");
userPassport(router, passport);

//404 에러 페이지 처리
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

  database_loader.init(app, config);
});

//==== socket.io 서버 시작 ====//
var io = socketio.listen(server);
console.log("socket.io 요청을 받아들일 준비가 되었습니다.");

io.sockets.on("connection", (socket) => {
  // 클라이언트와 연결된 socket
  console.log(
    "connection info => " + JSON.stringify(socket.request.connection._peername)
  );

  socket.remoteAddress = socket.request.connection._peername.address;
  socket.remotePort = socket.request.connection._peername.port;

  socket.on("message", (message) => {
    console.log("message 받음 -> " + JSON.stringify(message));

    if (message.recepient == "ALL") {
      console.log("모든 클라이언트에게 메시지 전송함.");

      io.sockets.emit("message", message);
    }
  });
});
