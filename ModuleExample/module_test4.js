var user = require("./user4");

var showUser = () => {
  return user().name + ", " + "No Group";
};

console.log("사용자 정보 : " + showUser());
