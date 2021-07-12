var user = require("./user3");

var showUser = () => {
  return user.getUser().name + ", " + user.group.name;
};

console.log("사용자 정보 : " + showUser());
