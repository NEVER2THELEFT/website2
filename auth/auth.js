const bcrypt = require("bcrypt");
const userModel = require("../models/user_model");
const jwt = require("jsonwebtoken");

exports.login = function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  userModel.lookup(username, function (err, user) {
    if (err) {
      console.log("error looking up user", err);
      return res.status(401).send();
    }
    if (!user) {
      console.log("user ", username, " not found");
      return res.render("user/register");
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let payload = { username: username };
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 300 });
        res.cookie("jwt", accessToken);

        req.user = { username };  // store user for downstream use
        next(); // Pass control to controller.handle_login
      } else {
        res.render("user/login");
      }
    });
  });
};

exports.verify = function (req, res, next) {
  let accessToken = req.cookies.jwt;
  console.log("Access token received:", accessToken);

  if (!accessToken) {
    console.log("No access token found");
    return res.redirect('/accessdenied');
  }

  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("Payload decoded:", payload);

    req.user = { username: payload.username }; // Store the user for downstream
    next();
  } catch (e) {
    console.error("Error verifying token:", e);
    return res.redirect('/accessdenied');
  }
};
