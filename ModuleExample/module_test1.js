var user1 = require("./user1");

var showUser = () => {
  return user1.getUser().name + ", " + user1.group.name;
};

console.log("사용자 정보 -> " + showUser());
