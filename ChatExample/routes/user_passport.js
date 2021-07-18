module.exports = (router, passport) => {
  console.log("user_passport 호출됨.");

  //==== 회원가입과 로그인 라우팅 함수 ====//
  router.route("/").get((req, res) => {
    console.log("/ 패스로 요청됨.");

    res.render("index.ejs");
  });

  router.route("/login").get((req, res) => {
    console.log("/login 패스로 GET 요청됨.");

    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  router.route("/login").post(
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

  router.route("/signup").get((req, res) => {
    console.log("/signup 패스로 GET 요청됨.");

    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  router.route("/signup").post(passport.authenticate("local-signup"), {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true,
  });

  router.route("/profile").get((req, res) => {
    console.log("/profile 패스로 GET 요청됨.");

    console.log("req.user 객체 정보");
    console.dir(req.user);

    if (!req.user) {
      console.log("사용자 인증 안된 상태임.");
      res.redirect("/");
    } else {
      console.log("사용자 인증된 상태임");

      if (Array.isArray(req.user)) {
        res.render("profile.ejs", { user: req.user[0]._doc });
      } else {
        res.render("profile.ejs", { user: req.user });
      }
    }
  });

  router.route("/logout").get((req, res) => {
    console.log("/logout 패스로 GET 요청됨.");

    res.logout();
    res.redirect("/");
  });
};
