const passport = require("passport");
const LocalStrategy = require("passport-local");
const knex = require("../db/knex");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const cookieSession = require("cookie-session");
const secret = "secretCuisine123";

module.exports = function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

passport.deserializeUser(async function (id, done) {
 console.log("deserializeUser");
 try {
 const user = await User.findById(id);
 done(null, user);
 } catch (error) {
 done(error, null);
 }
});

  passport.use(new LocalStrategy({
  usernameField: "username",
  passwordField: "password",
}, function (username, password, done) {
  console.log("--- Passport LocalStrategy Debug ---");
  console.log("Attempting login for username:", username);
  console.log("Password provided:", password);

  knex("users")
    .where({
      name: username,
    })
    .select("*")
    .then(async function (results) {
      console.log("Database query results:", results);

      if (results.length === 0) {
        console.log("User not found in DB.");
        return done(null, false, {message: "Invalid User"});
      } else if (await bcrypt.compare(password, results[0].password)) {
        console.log("Password comparison result: TRUE");
        return done(null, results[0]);
      } else {
        console.log("Password comparison result: FALSE. Stored hash:", results[0].password);
        return done(null, false, {message: "Invalid User"});
      }
    })
    .catch(function (err) {
      console.error("Database error during login:", err);
      return done(null, false, {message: err.toString()})
    });
}
));

  app.use(
    cookieSession({
      name: "session",
      keys: [secret],

      // Cookie Options
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};