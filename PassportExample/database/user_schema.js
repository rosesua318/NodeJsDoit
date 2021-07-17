var crypto = require("crypto");

var Schema = {};

Schema.createSchema = (mongoose) => {
  console.log("createSchema 호출됨.");

  var UserSchema = mongoose.Schema({
    email: { type: String, default: "" },
    hashed_password: { type: String, required: true, default: "" },
    salt: { type: String, require: true },
    name: { type: String, index: "hashed", default: "" },
    created_at: { type: Date, index: { unique: false }, default: Date.now() },
    updated_at: { type: Date, index: { unique: false }, default: Date.now() },
  });
  console.log("UserSchema 정의함.");

  // email 유효성 검사
  UserSchema.path("email").validate((email) => {
    return email.length;
  }, "email 칼럼의 값이 없습니다.");

  UserSchema.virtual("password").set(function (password) {
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
    console.log("virtual password 저장됨 : " + this.hashed_password);
  });

  UserSchema.method("encryptPassword", function (plainText, inSalt) {
    if (inSalt) {
      return crypto.createHmac("sha1", inSalt).update(plainText).digest("hex");
    } else {
      return crypto
        .createHmac("sha1", this.salt)
        .update(plainText)
        .digest("hex");
    }
  });

  // 특정 값을 랜덤하게 만드는 함수
  UserSchema.method("makeSalt", function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  });

  UserSchema.method(
    "authenticate",
    function (plainText, inSalt, hashed_password) {
      if (inSalt) {
        console.log("authenticate 호출됨.");
        return this.encryptPassword(plainText, inSalt) === hashed_password;
      } else {
        console.log("authenticate 호출됨.");
        return this.encryptPassword(plainText) === hashed_password;
      }
    }
  );

  UserSchema.static("findByEmail", function (email, callback) {
    return this.find({ email: email }, callback);
  });

  UserSchema.static("findAll", function (callback) {
    return this.find({}, callback);
  });
  return UserSchema;
};

module.exports = Schema;
