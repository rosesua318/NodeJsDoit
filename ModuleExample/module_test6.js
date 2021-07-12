var require = (path) => {
  var exports = {};
  exports.getUser = () => {
    return { id: "test01", name: "소녀시대" };
  };
  exports.group = { id: "group01", name: "친구" };

  return exports;
};

var user = require("...");

var showUser = () => {
  return user.getUser().name + ", " + user.group.name;
};

console.log("사용자 정보 : " + showUser());
