require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session);

const { loginUser, googleLogin } = require("./controllers/userController");
const User = require("./models/userSchema");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const groupRoutes = require("./routes/groupRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const securityRoutes = require("./routes/securityRoutes");
const taskHistoryRoutes = require("./routes/entryRoutes");
const syncRoutes = require("./routes/syncRoutes");
const dbConnect = require("./functions/db");
// const {Strategy: GoogleStrategy} = require("passport-google-oauth20");

// Express app
const app = express();

// Session store
const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

console.log(process.env.NODE_ENV)
const isDev = process.env.NODE_ENV === "dev"
app.set("trust proxy", 1);

// Middleware
app.use(express.json());

const corsOptions = {
  origin: [
    "https://productivity-hub-website.vercel.app",
    "http://localhost:5173",
    "https://taskflow.kprasinos.com",
    "http://tauri.localhost"
  ],
  methods: ["POST", "GET"],
  credentials: true,
};

// CORS must be first so headers are present even on error responses
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: "ProductivityHubCookie",
    cookie: {
      secure: !isDev,
      sameSite: !isDev ? "none" : "lax",
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // One month
    },
  }),
);

app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.json("Hello there");
});

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (user, done) {
  User.findById(user, (err, user) => {
    done(null, user);
  });
});

passport.use(loginUser);
passport.use(googleLogin);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/entry", taskHistoryRoutes);
app.use("/api/sync", syncRoutes);

app.use((err, req, res, next) => {
  cors(corsOptions)(req, res, () => {
    if (err.message) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
});

if (!process.env.MONGODB_URI) {
  throw new Error("Please provide a MONGODB_URI in the .env file");
}

// Connect to database
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Reduce timeout to 5 seconds
    })
    .then(() => {
      if (process.env.NODE_ENV !== "test") {
        app.listen(process.env.PORT, () => {
          console.log(
            "connected to database and listening to port: ",
            process.env.PORT,
          );
        });
      }
      console.log("Connected to database");
    })
    .catch((error) => {
      console.log("Database connection error:", error);
    });
}

module.exports = app;
