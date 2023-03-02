const validator = require("validator");
const VerificationCode = require('../models/verificationCodeSchema');
const User = require('../models/userSchema');
const bcrypt = require("bcrypt");
const {sendEmail} = require('../functions/sendEmail');
const crypto = require('crypto');


const checkVerificationCode = (email, code) => {
    if (!email || !code) return {error: 'All fields must be filled.', errorCode: 400}
    if (!validator.isEmail(email)) return {error: 'Email is invalid', errorCode: 400};

    VerificationCode.findOne({userEmail: email}, async (err, foundCode) => {
        if (err) return {error: "Internal server error", errorCode: 500};
        if (!foundCode) return {error: "Verification code validation failed.", errorCode: 400};

        if (!bcrypt.compareSync(code, foundCode.code)) return {error: 'Verification code validation failed.', errorCode: 400};

        return {error: false};
    })
    return {error: "Internal server error"};
}

const resetPasswordSendCode = async (req, res) => {
    if (req.user) {
        const email = req.user.local.email;

        await sendEmail(email, 'resetPassword');
        return res.status(200).json({message: 'We sent you an email.'});
    }

    const {email}  = req.body;

    if (!email) {
        return res.status(400).json({message: 'Email must be filled.'});
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Email is invalid.'});
    }

    User.findOne({'local.email': email}, async (err, userExists) => {
        if (userExists && userExists.active) {
            await sendEmail(email, 'resetPassword');
        }

        return res.status(200).json({message: 'If there is an account created with the email you entered, we sent it an email.'});
    });
}

const resetPasswordResendCode = async (req, res) => {
    await resetPasswordSendCode(req, res);
}

const resetPasswordVerifyCode = async (req, res) => {
    const code = req.body?.code;
    let email;

    if (req.user) {
        email = req.user.local.email;
    } else {
        email = req.body?.email;
    }

    const {verificationError, errorCode} = checkVerificationCode(email, code);

    if (verificationError) {
        return res.status(errorCode).json({message: verificationError});
    }

    return res.status(200).json({message: 'Email verification successful.'});
}

const resetPasswordSetPassword = async (req, res) => {
    let email;

    if (req.user) {
        email = req.user.local.email;
    } else {
        email = req.body?.email;
    }


    if (email) {
        const {code, newPassword} = req.body;

        if (!newPassword) {
            return res.status(400).json({message: 'Password must be filled.'})
        }

        const {verificationError, errorCode} = checkVerificationCode(email, code);

        if (verificationError) {
            return res.status(errorCode).json({message: verificationError});
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

const changeEmailSendCode = async (req, res) => {
    if (req.user) {
        const {password, newEmail} = req.body;

        if (!password || !newEmail) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!bcrypt.compareSync(password, req.user.local.password)) {
            res.status(400).json({message: 'Incorrect password.'});
        }

        if (!validator.isEmail(newEmail)) {
            return res.status(400).json({message: 'Email is invalid.'})
        }

        req.session.newEmail = newEmail;
        req.session.newEmailValidUntil = new Date((new Date).getTime() + 30 * 60 * 1000).getTime(); // Current time +30mins.

        try {
            await sendEmail(newEmail, "changeEmail");
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

        return res.status(200).json({message: "We sent you an email."});
    } else {
        res.status(401).send({message: "Not authorized"});
    }
}

const changeEmailResendCode = async (req, res) => {
    await changeEmailSendCode(req, res);
}
const changeEmailVerifyCode = async (req, res) => {
    if (req.user) {
        const currentEmail = req.user.local.email;
        const {newEmail, newEmailValidUntil} = req.session;
        const {code} = req.body;

        if (!newEmail || !newEmailValidUntil || newEmailValidUntil < (new Date()).getTime()) return res.status(400).json({message: "Unauthorized."});

        const {verificationError, errorCode} = checkVerificationCode(newEmail, code);

        if (verificationError) {
            return res.status(errorCode).json({message: verificationError});
        }

        try {
            await User.findOneAndUpdate({'local.email': currentEmail}, {$set: {'local.email': newEmail}});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

        req.session.newEmail = undefined;
        req.session.newEmailValidUntil = undefined;

    } else {
        return res.status(401).json({message: 'Unauthorized.'})
    }
}

module.exports = {resetPasswordSendCode, resetPasswordResendCode, resetPasswordVerifyCode, resetPasswordSetPassword, changeEmailSendCode, changeEmailVerifyCode, changeEmailResendCode};