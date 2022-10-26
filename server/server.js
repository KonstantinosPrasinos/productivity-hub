require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const userRoutes = require('./routes/userRoutes');
const {loginUser} = require('./controllers/userController')

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Routes
app.use('/api/user', userRoutes);

passport.use(loginUser);

// Connect to database
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('connected to database and listening to port: ', process.env.PORT);
        });
    })
    .catch(error => {
        console.log(error);
    })