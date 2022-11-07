require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors')

const {loginUser} = require('./controllers/userController');
const User = require('./models/userSchema');

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const groupRoutes = require('./routes/groupRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000 // One month
        }
    })
);
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(user, done) {
    User.findById(user, (err, user) => {
        done(null, user);
    })
});

passport.use(loginUser);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/verify', verificationRoutes);

// Connect to database
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        if (process.env.NODE_ENV !== 'test') {
            app.listen(process.env.PORT, () => {
                console.log('connected to database and listening to port: ', process.env.PORT);
            });
        }
    })
    .catch(error => {
        console.log(error);
    });

module.exports = app;