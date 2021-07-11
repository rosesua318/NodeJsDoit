var express = require("express");
var http = require("http");
var static = require("serve-static");
var path = require("path");

var bodyParser = require("body-parser");

var multer = require("multer");
var fs = require("fs");

var cors = require("cors"); // 다중 서버 접속 지원 위함

var app = express();

app.set("port", process.env.PORT || 3000);
app.use("/public", static(path.join(__dirname, "public")));
app.use("/uploads", static(path.join(__dirname, "uploads")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    //callback(null, file.originalname + Date.now());

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

var router = express.Router();

router.route("/process/photo").post(upload.array("photo", 1), (req, res) => {
  console.log("/process/photo 라우팅 함수 호출됨.");

  var files = req.files;
  console.log("==== 업로드된 파일 ====");
  if (files.length > 0) {
    console.dir(files[0]);
  } else {
    console.log("파일이 없습니다.");
  }

  var originalname;
  var filename;
  var mimetype;
  var size;
  if (Array.isArray(files)) {
    for (var i = 0; i < files.length; i++) {
      originalname = files[i].originalname;
      filename = files[i].filename;
      mimetype = files[i].mimetype;
      size = files[i].size;
    }
  }

  res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
  res.write("<h1>파일 업로드 성공</h1>");
  res.write("<p>원본파일 : " + originalname + "</p>");
  res.write("<p>저장파일 : " + filename + "</p>");
  res.end();
});

app.use("/", router); // 라우팅 함수 등록

app.all("*", (req, res) => {
  res.status(404).send("<h1>요청하신 페이지는 없어요.</h1>");
});

var server = http.createServer(app).listen(app.get("port"), () => {
  console.log("익스프레스로 웹 서버를 실행함 : " + app.get("port"));
});
