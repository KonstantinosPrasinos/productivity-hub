const validator = require("validator");
const VerificationCode = require('../models/verificationCodeSchema');
const User = require('../models/userSchema');
const bcrypt = require("bcrypt");

const verifyEmail = (req, res) => {
    const {email, code} = req.body;

    if (!email || !code) {return res.status(400).json({error: 'All fields must be filled.'})}

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Email is invalid.'});
    }

    VerificationCode.findOne({userEmail: email}, (err, verificationCode) => {
        if (err) {return res.statusCode(500).json({message: 'Internal server error.'})}
        if (!verificationCode) {return res.status(400).json({message: 'Incorrect email or verification code.'})}

        if (!bcrypt.compareSync(code, verificationCode.code)) {return res.status(400).json({message: 'Incorrect email or verification code.'})}

        User.findOneAndUpdate({'local.email': email}, {$set: {'active': true}});

        return res.status(200).json();
    })
}

module.exports = {verifyEmail};