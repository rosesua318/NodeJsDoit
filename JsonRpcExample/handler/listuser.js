const listuser = (params, callback) => {
  console.log("RPC - listuser 호출됨.");
  console.log("PARAMS -> " + JSON.stringify(params));

  const database = global.database;
  if (database) {
    console.log("database 객체 참조함.");
  } else {
    console.log("database 객체 없음.");
    const error = {
      code: 410,
      message: "database 객체 없음.",
    };
    callback(error, null);

    return;
  }

  if (database.db) {
    database.UserModel.findAll((err, results) => {
      if (err) {
        const error = {
          code: 410,
          message: err.message,
        };
        callback(error, null);

        return;
      }

      if (results) {
        const output = [];
        for (var i = 0; i < results.length; i++) {
          const curId = results[i]._doc.id;
          const curName = results[i]._doc.name;
          output.push({ id: curId, name: curName });
        }

        callback(null, output);
      } else {
        const error = {
          code: 410,
          message: "database 조회 결과가 없습니다.",
        };
        callback(error, null);
      }
    });
  }
};

module.exports = listuser;
