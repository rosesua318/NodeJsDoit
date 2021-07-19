const { connect } = require("http2");

var mongoose = require("mongoose");

var database = {};

database.init = (app, config) => {
  console.log("init 호출됨.");

  connect(app, config);
};

var connect = (app, config) => {
  console.log("connect 호출됨.");

  mongoose.Promise = global.Promise;
  mongoose.connect(config.db_url);
  database.db = mongoose.connection;

  // 데이터베이스가 연결됐을 때 실행되는 이벤트
  database.db.on("open", () => {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    createSchema(app, config);
  });

  // 데이터베이스 연결이 끊어졌을 때 실행되는 이벤트
  database.db.on("disconnected", () => {
    console.log("데이터베이스 연결 끊어짐.");
  });

  // 데이터베이스에 에러가 생겼을 때 실행되는 이벤트
  database.db.on("error", console.error.bind(console, "mongoose 연결 에러."));
};

var createSchema = (app, config) => {
  console.log("설정의 DB 스키마 수 : " + config.db_schemas.length);

  for (var i = 0; i < config.db_schemas.length; i++) {
    var curItem = config.db_schemas[i];

    var curSchema = require(curItem.file).createSchema(mongoose);
    console.log("%s 모듈을 이용해 스키마 생성함.", curItem.file);

    var curModel = mongoose.model(curItem.collection, curSchema);
    console.log("%s 컬렉션을 위해 모델 정의함.", curItem.collection);

    database[curItem.schemaName] = curSchema;
    database[curItem.modelName] = curModel;
    console.log(
      "스키마 [%s], 모델 [%s] 생성됨.",
      curItem.schemaName,
      curItem.modelName
    );
  }

  app.set("database", database);
};

module.exports = database;
