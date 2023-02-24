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
const verifyEmail = async (req, res) => {
    const {code, email} = req.body?.code;

    const {verificationError, errorCode} = checkVerificationCode(email, code);

    if (verificationError) {
        return res.status(errorCode).json({message: verificationError});
    }

    await User.findOneAndUpdate({'local.email': email}, {$set: {'active': true}});
    await VerificationCode.findOneAndDelete({userEmail: email});

    return res.status(200).json({message: 'Email verification successful.'});
}

const resendVerifyEmail = async (req, res, type='email') => {
    const {email} = req.body;

    if (!email) {return res.status(400).json({message: 'All fields must be filled.'})}

    if (!validator.isEmail(email)) {return res.status(400).json({message: 'Email is invalid.'})}

    let randomCode = crypto.randomInt(100000, 999999);

    await VerificationCode.findOneAndUpdate({userEmail: email}, {$set: {code: bcrypt.hashSync(randomCode.toString(), 10)}});

    await sendEmail(email, type);

    return res.status(200).json({message: 'Email resent successfully.'});
}

const verifyForgotPassword = async (req, res) => {
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

    await VerificationCode.findOneAndDelete({userEmail: email});
    req.session.userEmail = email;

    return res.status(200).json({message: 'Email verification successful.'});
}

const resendForgotPasswordEmail = async (req, res) => {
    await resendVerifyEmail(req, res, 'resetPassword');
}

module.exports = {verifyEmail, resendVerifyEmail, verifyForgotPassword, resendForgotPasswordEmail};