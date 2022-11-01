const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/userSchema');

const signupUser = (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {return res.status(400).json({error: 'All fields must be filled.'})}
    User.findOne({'local.email': email}, async (err, userExists) => {
        if (userExists) {return res.status(409).json({error: 'User already exists'})}

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await User.create({local: {email, password: hashedPassword}});

        return res.json({user: {...user._doc, local: {email, password: undefined}, google: undefined}});
    });
}

const loginUser = new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({'local.email': email}, (err, user) =>{
        if (err) {return done(err)}
        if (!user) {return done(null, false, {message: 'Incorrect username or password'})}
        if (!bcrypt.compareSync(password, user.local.password)) {return done(null, false, { message: 'Incorrect username or password.' })}

        return done(null, user);
    })
});

const logoutUser = (req, res) => {
    if (req.user) {
        req.session.destroy();
        res.clearCookie('connect.sid');
        return res.json({msg: 'Logging user out.'});
    } else {
        return res.status(400).json({msg: 'No user to log out.'})
    }
}

module.exports = {loginUser, signupUser, logoutUser};