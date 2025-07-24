const LocalStrategy = require("passport-local").Strategy;
const GoogleOneTapStrategy =
  require("passport-google-one-tap").GoogleOneTapStrategy;
const bcrypt = require("bcrypt");
const validator = require("validator");

const { sendEmail } = require("../functions/sendEmail");

const User = require("../models/userSchema");
const Settings = require("../models/settingsSchema");
const Task = require("../models/taskSchema");
const Category = require("../models/categorySchema");
const Group = require("../models/groupSchema");
const Entry = require("../models/entrySchema");

const createUser = async (parameters) => {
  const user = await User.create(parameters);
  if (user?._id) {
    await Settings.create({ userId: user._id });
  }

  return user;
};
const signupUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields must be filled." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email is invalid." });
  }

  User.findOne({ "local.email": email }, async (err, userExists) => {
    if (userExists && userExists.active) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    if (!userExists) {
      await createUser({ local: { email: email, password: hashedPassword } });
    }

    await sendEmail(email, "setEmail");

    return res.status(200).json({ message: "Email verification code sent." });
  });
};

const loginUser = new LocalStrategy(
  { usernameField: "email" },
  (email, password, done) => {
    User.findOne({ "local.email": email }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      if (!bcrypt.compareSync(password, user.local.password)) {
        return done(null, false, { message: "Incorrect email or password." });
      }

      return done(null, user);
    });
  }
);

const googleLoginDesktop = async (req, res) => {
  const { code, port } = req.body; // Or req.query if you send it as query param

  // You'll need to manually perform the code exchange here
  // because your Tauri app is already handling the initial redirect.
  // passport-google-oauth20 typically handles this when it sets up the redirect route.
  // Since you're getting the 'code' directly from Tauri, you'll use Google's Node.js client library
  // or a direct HTTPS request to exchange the code for tokens.

  const { OAuth2Client } = require('google-auth-library');

  const client = new OAuth2Client(
      process.env.DESKTOP_GOOGLE_CLIENT_ID,
      process.env.DESKTOP_GOOGLE_CLIENT_SECRET,
      `http://localhost:${port}`
  );

  try {
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.DESKTOP_GOOGLE_CLIENT_ID,
    });

    console.log('ID Token:', tokens.id_token);
    const payload = ticket.getPayload();
    console.log('Payload:', payload);

    const googleAccountId = payload['sub'];
    const googleAccountEmail = payload['email'];

    // Check if the user already exists
    let user;

    try {
      user = await User.findOne({ googleId: googleAccountId });
    } catch (err) {
      console.log("error1")
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }

    if (!user) {
      let emailUser;

      try {
        emailUser = await User.findOne({
          "local.email": googleAccountEmail,
        });
      } catch (err) {
        console.log("error2")
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }

      if (emailUser)
        return res.status(400).json({ success: false, message: 'User already exists with this email' });

      try {
        user = await createUser({
          googleId: googleAccountId,
          local: { email: googleAccountEmail },
          active: true,
        });
      } catch (err) {
        console.log("error3")
        res.status(500).json({ success: false, message: 'Authentication failed' });
      }
    }

    // Log in user to passport (uses passport.serializeUser)
    req.logIn({ _id: user._id, }, async (loginErr) => {
      if (loginErr) {
        console.error('Passport login error:', loginErr);
        return res.status(500).json({ success: false, message: 'Failed to log in user.' });
      }

      return res.status(200).json({user: {_id: user._id, local: {email: googleAccountEmail}, googleLinked: true, active: undefined}});
    });
  } catch (error) {
    console.error('Error exchanging code or verifying ID token:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
}

const googleLogin = new GoogleOneTapStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    verifyCsrfToken: false, // whether to validate the csrf token or not
  },
  async (profile, done) => {
    let user;

    try {
      user = await User.findOne({ googleId: profile.id });
    } catch (err) {
      return done(err);
    }

    if (!user) {
      let emailUser, newUser;
      try {
        emailUser = await User.findOne({
          "local.email": profile.emails[0].value,
        });
      } catch (err) {
        return done(err);
      }

      if (emailUser)
        return done(null, false, {
          message: "Account already exists for this email.",
        });

      try {
        newUser = await createUser({
          googleId: profile.id,
          local: { email: profile.emails[0].value },
          active: true,
        });
      } catch (err) {
        return done(err);
      }

      return done(null, newUser);
    }

    return done(null, user);
  }
);

const logoutUser = (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logging user out." });
  } else {
    return res.status(400).json({ message: "No user to log out." });
  }
};

const deleteAllData = async (id) => {
  await Task.deleteMany({ userId: id });
  await Entry.deleteMany({ userId: id });
  await Group.deleteMany({ userId: id });
  await Category.deleteMany({ userId: id });
};

const deleteUser = async (req, res) => {
  if (req.user) {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "All fields must be filled." });
    }

    if (!bcrypt.compareSync(password, req.user.local.password)) {
      res.status(400).json({ message: "Incorrect password." });
    }

    try {
      await Settings.findOneAndDelete({ userId: req.user._id });

      await User.findByIdAndDelete(req.user._id.toString());

      req.session.destroy();
      res.clearCookie("connect.sid");
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } else {
    res.status(401).send({ message: "Not authorized" });
  }
};

const resetUser = async (req, res) => {
  if (req.user) {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "All fields must be filled." });
    }

    if (!bcrypt.compareSync(password, req.user.local.password)) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    try {
      await Settings.findOneAndUpdate(
        { userId: req.user._id },
        {
          $set: { theme: "Light", defaults: { step: 1, goal: 1, priority: 1 } },
        }
      );
      await deleteAllData(req.user._id);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "User reset successfully." });
  } else {
    res.status(401).send({ message: "Not authorized" });
  }
};

module.exports = {
  loginUser,
  signupUser,
  logoutUser,
  deleteUser,
  resetUser,
  googleLogin,
  googleLoginDesktop
};
