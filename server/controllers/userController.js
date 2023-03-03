const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const validator = require('validator');

const {sendEmail} = require('../functions/sendEmail');

const User = require('../models/userSchema');
const Settings = require('../models/settingsSchema');
const Task = require('../models/taskSchema');
const Category = require('../models/categorySchema');
const Group = require('../models/groupSchema');
const Entry = require('../models/entrySchema');

const signupUser = (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {return res.status(400).json({error: 'All fields must be filled.'})}

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Email is invalid.'})
    }

    User.findOne({'local.email': email}, async (err, userExists) => {
        if (userExists && userExists.active) {return res.status(409).json({message: 'User already exists.'})}

        const hashedPassword = bcrypt.hashSync(password, 10);

        if (!userExists) {
            const user = await User.create({local: {email: email, password: hashedPassword}});
            await Settings.create({userId: user._id});
        }

        await sendEmail(email, 'setEmail');

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

const deleteAllData = async (id) => {
    await Task.deleteMany({userId: id});
    await Entry.deleteMany({userId: id});
    await Group.deleteMany({userId: id});
    await Category.deleteMany({userId: id});
}

const deleteUser = async (req, res) => {
    if (req.user) {
        const {password} = req.body;

        if (!password) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect password.'});
        }

        try {
            await Settings.findOneAndDelete({'userId': req.user._id})

            await User.findByIdAndDelete(req.user._id.toString());

            req.session.destroy();
            res.clearCookie('connect.sid');
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

        return res.status(200).json({message: 'User deleted successfully.'});
    } else {
        res.status(401).send({message: "Not authorized"});
    }
}

const resetUser = async (req, res) => {
    if (req.user) {
        const {password} = req.body;

        if (!password) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect password.'});
        }
        
        try {
            await Settings.findOneAndUpdate({userId: req.user._id}, {$set: {'theme': 'Light', 'defaults': {'step': 1, 'goal': 1, 'priority': 1}}});
            await deleteAllData(req.user._id)
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

        console.log('reset successful')

        return res.status(200).json({message: 'User reset successfully.'});
    }
}

module.exports = {loginUser, signupUser, logoutUser, deleteUser, resetUser};