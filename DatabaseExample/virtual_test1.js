var mongoose = require("mongoose");

var database;
var UserSchema;
var UserModel;

var connectDB = () => {
  var databaseUrl = "mongodb://localhost:27017/local";

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  // 데이터베이스가 연결됐을 때 실행되는 이벤트
  database.on("open", () => {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    createUserSchema();

    doTest();
  });

  // 데이터베이스 연결이 끊어졌을 때 실행되는 이벤트
  database.on("disconnected", () => {
    console.log("데이터베이스 연결 끊어짐.");
  });

  // 데이터베이스에 에러가 생겼을 때 실행되는 이벤트
  database.on("error", console.error.bind(console, "mongoose 연결 에러."));
};

var createUserSchema = () => {
  UserSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, index: "hashed" },
    age: { type: Number, default: -1 },
    created_at: { type: Date, index: { unique: false }, default: Date.now() },
    updated_at: { type: Date, index: { unique: false }, default: Date.now() },
  });
  console.log("UserSchema 정의함.");

  UserSchema.virtual("info")
    .set(function (info) {
      var splitted = info.split(" ");
      this.id = splitted[0];
      this.name = splitted[1];
      console.log("virtual info 속성 설정됨 : " + this.id + ", " + this.name);
    })
    .get(function () {
      return this.id + " " + this.name;
    });

  UserModel = mongoose.model("users4", UserSchema);
  console.log("UserModel 정의함");
};

var doTest = () => {
  var user = new UserModel({ info: "test01 소녀시대" });

  user.save((err) => {
    if (err) {
      console.log("에러 발생");
      return;
    }

    console.log("데이터 추가함.");
  });
};

connectDB();
