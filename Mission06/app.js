// Express 기본 모듈 불러오기
var express = require("express");
var http = require("http");
var path = require("path");

// Express의 미들웨어 불러오기
var bodyParser = require("body-parser");
var static = require("serve-static");

// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");

// 파일 처리
var fs = require("fs");

// 파일 업로드용 미들웨어
var multer = require("multer");

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require("cors");

// mime 모듈
var mime = require("mime");

//===== mongoose 모듈 사용 =====//
const mongoose = require("mongoose");

// 익스프레스 객체 생성
var app = express();

// 포트 설정
app.set("port", process.env.PORT || 3000);

// body-parser 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/public", static(path.join(__dirname, "public")));
app.use("/uploads", static(path.join(__dirname, "uploads")));

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());

//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, file, callback) {
    var extension = path.extname(file.originalname);
    var basename = path.basename(file.originalname, extension);
    callback(null, basename + Date.now() + extension);
  },
});

var upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 1024,
  },
});

//===== 데이터베이스 연결 =====//
// 데이터베이스 객체를 위한 변수 선언
let database;

// 데이터베이스 스키마 객체를 위한 변수 선언
let PhotoMemoSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
let PhotoMemoModel;

//데이터베이스에 연결
function connectDB() {
  // 데이터베이스 연결 정보
  var databaseUrl = "mongodb://localhost:27017/local";

  // 데이터베이스 연결
  console.log("데이터베이스 연결을 시도합니다.");
  mongoose.Promise = global.Promise; // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on(
    "error",
    console.error.bind(console, "mongoose connection error.")
  );
  database.on("open", () => {
    console.log("데이터베이스에 연결되었습니다. : " + databaseUrl);

    // 스키마 정의
    PhotoMemoSchema = mongoose.Schema({
      author: String,
      createDate: String,
      contents: String,
      filename: String,
    });
    console.log("PhotoMemoSchema 정의함.");

    // MemoModel 모델 정의
    PhotoMemoModel = mongoose.model("photomemos", PhotoMemoSchema);
    console.log("PhotoMemoModel 정의함.");
  });

  // 연결 끊어졌을 때 5초 후 재연결
  database.on("disconnected", function () {
    console.log("연결이 끊어졌습니다. 5초 후 재연결합니다.");
    setInterval(connectDB, 5000);
  });
}

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();

// 메모 저장을 위한 라우팅 함수
router.route("/process/save").post(upload.array("photo", 1), (req, res) => {
  console.log("/process/save 호출됨.");

  // 요청 파라미터 확인
  const paramAuthor = req.body.author || req.query.author;
  const paramContents = req.body.contents || req.query.contents;
  const paramCreateDate = req.body.createDate || req.query.createDate;

  console.log("작성자 : " + paramAuthor);
  console.log("내용 : " + paramContents);
  console.log("일시 : " + paramCreateDate);

  const files = req.files;

  console.dir("#===== 업로드된 첫번째 파일 정보 =====#");
  console.dir(req.files[0]);
  console.dir("#=====#");

  // 현재의 파일 정보를 저장할 변수 선언
  var originalname = "",
    filename = "",
    mimetype = "",
    size = 0;

  if (Array.isArray(files)) {
    // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
    console.log("배열에 들어있는 파일 갯수 : %d", files.length);

    for (var index = 0; index < files.length; index++) {
      originalname = files[index].originalname;
      filename = files[index].filename;
      mimetype = files[index].mimetype;
      size = files[index].size;
    }
    console.log(
      "현재 파일 정보 : " +
        originalname +
        ", " +
        filename +
        ", " +
        mimetype +
        ", " +
        size
    );
  } else {
    console.log("업로드된 파일이 배열에 들어가 있지 않습니다.");
  }

  // 데이터베이스 객체가 초기화된 경우, insertMemo 함수 호출하여 메모 추가
  if (database) {
    insertMemo(
      paramAuthor,
      paramContents,
      paramCreateDate,
      filename,
      (err, addedMemo) => {
        // 에러 발생 시 - 클라이언트로 에러 전송
        if (err) {
          console.error("메모 저장 중 에러 발생 : " + err.stack);

          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>메모 저장 중 에러 발생</h2>");
          res.write("<p>" + err.stack + "</p>");
          res.end();

          return;
        }

        // 결과 객체 있으면 성공 응답 전송
        if (addedMemo) {
          console.dir(addedMemo);

          console.log("inserted " + addedMemo.affectedRows + " rows");

          res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
          res.write("<div><p>메모가 저장되었습니다.</p></div>");
          res.write('<img src="/uploads/' + filename + '" width="200px">');
          res.write(
            '<div><input type="button" value="다시 작성" onclick="javascript:history.back()"></div>'
          );
          res.end();
        } else {
          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>메모 저장 실패</h2>");
          res.end();
        }
      }
    );
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.write("<div><p>데이터베이스에 연결하지 못했습니다.</p></div>");
    res.end();
  }
});

app.use("/", router);

// 메모 추가 함수
var insertMemo = function (author, contents, createDate, filename, callback) {
  console.log(
    "insertMemo 호출됨 : " +
      author +
      ", " +
      contents +
      ", " +
      createDate +
      ", " +
      filename
  );

  const photomemo = new PhotoMemoModel({
    author: author,
    createDate: createDate,
    contents: contents,
    filename: filename,
  });

  // save()로 저장: 저장 성공 시  addedMemo 객체가 파라미터로 전달됨
  photomemo.save((err, addedMemo) => {
    if (err) {
      callback(err, null);
      return;
    }

    console.log("메모가 저장됨.");
    callback(null, addedMemo);
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

// 웹서버 시작
var server = http.createServer(app).listen(app.get("port"), function () {
  console.log(
    "웹 서버 시작됨 -> %s, %s",
    server.address().address,
    server.address().port
  );

  connectDB();
});
