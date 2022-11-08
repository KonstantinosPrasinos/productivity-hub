const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const validator = require('validator');

const {sendEmail} = require('../email/sendEmail');

const User = require('../models/userSchema');
const Settings = require('../models/settingsSchema');
const VerificationCode = require('../models/verificationCodeSchema');
const crypto = require('crypto');

const signupUser = (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {return res.status(400).json({error: 'All fields must be filled.'})}

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Email is invalid.'})
    }

    User.findOne({'local.email': email}, async (err, userExists) => {
        if (userExists && userExists.active) {return res.status(409).json({message: 'User already exists.'})}

        let randomCode = crypto.randomInt(100000, 999999);
        const hashedPassword = bcrypt.hashSync(password, 10);

        if (!userExists) {
            const user = await User.create({local: {email: email, password: hashedPassword}});
            await Settings.create({userId: user._id});
        } else if (!userExists.active) {
            await VerificationCode.findOneAndDelete({userEmail: email});
        }

        await VerificationCode.create({userEmail: email, code: bcrypt.hashSync(randomCode.toString(), 10)});

        await sendEmail(randomCode, email);

        return res.status(200).json({message: 'Email verification code sent.'});
    });
}

const loginUser = new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({'local.email': email}, (err, user) =>{
        if (err) {return done(err)}
        if (!user) {return done(null, false, {message: 'Incorrect email or password.'})}
        if (!bcrypt.compareSync(password, user.local.password)) {return done(null, false, { message: 'Incorrect email or password.' })}

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

const deleteUser = (req, res) => {
    if (req.user) {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect email or password.'});
        }

        Settings.findOneAndDelete({'userId': req.user.id})

        User.findByIdAndDelete(req.user._id.toString(), (err) => {
            if (err) {
                return res.status(409).json({message: 'Failed to delete user.' })
            }

        });

        req.session.destroy();
        res.clearCookie('connect.sid');

        return res.status(200).json({message: 'User deleted successfully.'});
    } else {
        res.status(401).send({message: "Not authorized"});
    }
}

const changePassword = async (req, res) => {
    if (req.user) {
        const {password, newPassword}  = req.body;

        if (!password || !newPassword) {
            return res.status(400).json({message: 'Password and new password required.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect password.'});
        }

        if (password === newPassword) {
            res.status(400).json({message: 'New password is the same as the old password.'})
        }

        const id = req.user._id.valueOf();

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.findByIdAndUpdate(id, {$set: {'local.password': hashedPassword}});

        return res.status(200).json({message: 'Password changed successfully.'});
    }
}

const changeEmail = async (req, res) => {
    if (req.user) {
        const {email, password, newEmail} = req.body;

        if (!email || !password || !newEmail) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect email or password.'});
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({message: 'Email is invalid.'})
        }

        const id = req.user._id.valueOf();

        const editedUser = await User.findByIdAndUpdate(id, {$set: {'local.email': newEmail}}, {returnNewDocument: true})

        return res.status(200).json({user: {...editedUser._doc, local: {email: newEmail, password: undefined}, google: undefined}});
    } else {
        res.status(401).send({message: "Not authorized"});
    }
}

module.exports = {loginUser, signupUser, logoutUser, deleteUser, changePassword, changeEmail};