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

var config = require("./config");

var database_loader = require("./database/database_loader");
var route_loader = require("./routes/route_loader");

// 암호화 모듈
var crypto = require("crypto");

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

//==== Passport 초기화 ====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//==== Passport Strategy 설정 ====//
var LocalStrategy = require("passport-local").Strategy;

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      console.log("passport의 local-login 호출됨 : " + email + ", " + password);

      var database = app.get("database");
      database.UserModel.findOne({ email: email }, (err, user) => {
        if (err) {
          console.log("에러 발생함.");
          return done(err);
        }

        if (!user) {
          console.log("사용자 정보가 일치하지 않습니다.");
          return done(
            null,
            false,
            req.flash("loginMessage", "등록된 계정이 없습니다.")
          );
        }

        var authenticated = user.authenticate(
          password,
          user._doc.salt,
          user._doc.hashed_password
        );
        if (!authenticated) {
          console.log("비밀번호가 일치하지 않습니다.");
          return done(
            null,
            false,
            req.flash("loginMessage", "비밀번호가 일치하지 않습니다.")
          );
        }

        console.log("아이디와 비밀번호가 일치합니다.");
        return done(null, user);
      });
    }
  )
);

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      var paramName = req.body.name || req.query.name;
      console.log(
        "passport의 local-signup 호출됨 : " +
          email +
          ", " +
          password +
          ", " +
          paramName
      );

      var database = app.get("database");
      database.UserModel.findOne({ email: email }, (err, user) => {
        if (err) {
          console.log("에러 발생.");
          return done(err);
        }

        if (user) {
          console.log("기존에 계정이 있습니다.");
          return done(
            null,
            false,
            req.flash("signupMessage", "계정이 이미 있습니다.")
          );
        } else {
          var user = new database.UserModel({
            email: email,
            password: password,
            name: paramName,
          });
          user.save((err) => {
            if (err) {
              console.log("데이터베이스에 저장 시 에러.");
              return done(
                null,
                false,
                req.flash(
                  "signupMessage",
                  "사용자 정보 저장시 에러가 발생했습니다."
                )
              );
            }

            console.log("사용자 데이터 저장함");
            return done(null, user);
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serializeUser 호출됨.");
  console.dir(user);

  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("deserializeUser 호출됨.");
  console.dir(user);

  done(null, user);
});

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();
route_loader.init(app, router);

//==== 회원가입과 로그인 라우팅 함수 ====//
router.route("/").get((req, res) => {
  console.log("/ 패스로 요청됨.");

  res.render("index.ejs");
});

router.route("/login").get((req, res) => {
  console.log("/login 패스로 GET 요청됨.");

  res.render("login.ejs", { message: req.flash("loginMessage") });
});

router.route("/login").post(
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.route("/signup").get((req, res) => {
  console.log("/signup 패스로 GET 요청됨.");

  res.render("signup.ejs", { message: req.flash("signupMessage") });
});

router.route("/signup").post(passport.authenticate("local-signup"), {
  successRedirect: "/profile",
  failureRedirect: "/signup",
  failureFlash: true,
});

router.route("/profile").get((req, res) => {
  console.log("/profile 패스로 GET 요청됨.");

  console.log("req.user 객체 정보");
  console.dir(req.user);

  if (!req.user) {
    console.log("사용자 인증 안된 상태임.");
    res.redirect("/");
  } else {
    console.log("사용자 인증된 상태임");

    if (Array.isArray(req.user)) {
      res.render("profile.ejs", { user: req.user[0]._doc });
    } else {
      res.render("profile.ejs", { user: req.user });
    }
  }
});

router.route("/logout").get((req, res) => {
  console.log("/logout 패스로 GET 요청됨.");

  res.logout();
  res.redirect("/");
});

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
