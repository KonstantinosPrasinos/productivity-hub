const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const validator = require('validator');

const {sendEmail} = require('../functions/sendEmail');

const User = require('../models/userSchema');
const Settings = require('../models/settingsSchema');
const VerificationCode = require('../models/verificationCodeSchema');
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

        await sendEmail(email, 'email');

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
            console.log(error.message);
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

const changeUserPassword = async (currentPassword, inputPassword, newPassword, email) => {
    if (!inputPassword || !newPassword) {
        return {status: 400, message: 'Password and new password required.'}
    }

    if (inputPassword === newPassword) {
        return {status: 400, message: 'New password is the same as the old password.'}
    }

    if (currentPassword && !bcrypt.compareSync(inputPassword, currentPassword)) {
        return {status: 400, message: 'Incorrect password.'}
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.findOneAndUpdate({'local.email': email}, {$set: {'local.password': hashedPassword}});

    return {status: 200};
}

const changePassword = async (req, res) => {
    if (req.user) {
        const {password, newPassword}  = req.body;

        const email = req.user.local.email;
        const currentPassword = req.user.local.password;

        const {status, message} = await changeUserPassword(currentPassword, password, newPassword, email);

        if (status !== 200) {
            return res.status(status).json({message});
        }

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

const forgotPasswordSendEmail = async (req, res) => {
    const {email}  = req.body;

    if (!email) {
        return res.status(400).json({message: 'Email must be filled.'});
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Email is invalid.'})
    }

    console.log('test')

    User.findOne({'local.email': email}, async (err, userExists) => {
        if (userExists && userExists.active) {
            await sendEmail(email, 'resetPassword')
        }

        return res.status(200).json({message: 'If there is an account created with the email you entered, we sent it an email.'});
    });
}

const forgotPasswordSetPassword = async (req, res) => {
    const email = req?.session.userEmail;

    if (email) {
        const {newPassword} = req.body;

        if (!newPassword) {
            return res.status(400).json({message: 'Password must be filled.'})
        }

        await VerificationCode.findOneAndDelete({userEmail: email});

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.findOneAndUpdate({'local.email': email}, {$set: {'local.password': hashedPassword}});

        req.session.destroy();
        res.clearCookie('connect.sid');

        return res.status(200).json({message: 'Password changed successfully.'})
    } else {
        return res.status(401).json({message: 'Unauthorized.'})
    }
}

module.exports = {loginUser, signupUser, logoutUser, deleteUser, changePassword, changeEmail, forgotPasswordSendEmail, forgotPasswordSetPassword, resetUser};