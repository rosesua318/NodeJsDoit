var local_login = require("./passport/local_login");
var local_signup = require("./passport/local_signup");

module.exports = (app, passport) => {
  console.log("config/passport 호출됨.");

  passport.serializeUser((user, done) => {
    console.log("serializeUser 호출됨.");
    console.dir(user);

    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log("deserializeUser 호출됨.");
    console.dir(user);

    done(null, user);
  });

  //==== Passport Strategy 설정 ====//
  passport.use("local-login", local_login);
  passport.use("local-signup", local_signup);
  console.log("passport strategy 등록됨.");
};
