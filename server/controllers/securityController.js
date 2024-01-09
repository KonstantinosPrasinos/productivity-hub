const validator = require("validator");
const VerificationCode = require('../models/verificationCodeSchema');
const User = require('../models/userSchema');
const bcrypt = require("bcrypt");
const {sendEmail} = require('../functions/sendEmail');


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

const changeEmailVerifyPassword = async (req, res) => {
    if (req.user) {
        const {password} = req.body;

        if (!password) return res.status(400).json({message: 'Password required,'});

        if (!bcrypt.compareSync(password, req.user.local.password)) return res.status(400).json({message: 'Incorrect password.'});

        req.session.changeEmailUntil = new Date((new Date).getTime() + 30 * 60 * 1000).getTime(); // Current time +30 minutes

        return res.status(200).json("Correct password.");
    } else {
        res.status(401).send({message: "Not authorized"});
    }
}

const changeEmailSendCode = async (req, res) => {
    if (req.user) {
        const {newEmail} = req.body;
        const {changeEmailUntil} = req.session;

        if (!newEmail || !changeEmailUntil || changeEmailUntil < (new Date()).getTime()) {
            return res.status(400).json({message: 'All fields must be filled.'});
        }

        if (!validator.isEmail(newEmail)) {
            return res.status(400).json({message: 'Email is invalid.'})
        }

        const emailAlreadyExists = await User.findOne({"local.email": newEmail});

        if (emailAlreadyExists) return res.status(400).json({message: 'Email already in use.'});

        req.session.newEmail = newEmail;

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
        const {newEmail, changeEmailUntil} = req.session;
        const {code} = req.body;

        if (!newEmail || !changeEmailUntil || changeEmailUntil < (new Date()).getTime()) return res.status(400).json({message: "Unauthorized."});

        const {verificationError, errorCode} = checkVerificationCode(newEmail, code);

        if (verificationError) {
            return res.status(errorCode).json({message: verificationError});
        }

        try {
            await User.findOneAndUpdate({_id: req.user._id}, {$set: {'local.email': newEmail}});
            await sendEmail(currentEmail, "emailChanged");
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

        req.session.newEmail = undefined;
        req.session.changeEmailUntil = undefined;

        req.session.destroy();
        res.clearCookie('connect.sid');

        return res.status(200).json({message: "Email changed."});
    } else {
        return res.status(401).json({message: 'Unauthorized.'})
    }
}

const registerVerifyCode = async (req, res) => {
    const {email, code} = req.body;

    const {verificationError, errorCode} = checkVerificationCode(email, code);

    if (verificationError) {
        return res.status(errorCode).json({message: verificationError});
    }

    try {
        await User.findOneAndUpdate({"local.email": email}, {$set: {active: true}});
    } catch (error) {
        return res.status(400).json({message: error.message});
    }

    return res.status(200).json({message: "Account created successfully."});
}

const registerResendCode = async (req, res) => {
    const {email} = req.body;

    await sendEmail(email, 'setEmail');

    return res.status(200).json({message: 'Email verification code sent.'});
}

module.exports = { registerVerifyCode, registerResendCode, resetPasswordSendCode, resetPasswordResendCode, resetPasswordVerifyCode, resetPasswordSetPassword, changeEmailVerifyPassword,changeEmailSendCode, changeEmailVerifyCode, changeEmailResendCode};