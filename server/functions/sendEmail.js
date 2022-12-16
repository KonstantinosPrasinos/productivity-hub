const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const verifyEmail = require('../email/verifyEmailTemplate');
const passwordReset = require('../email/passwordResetTemplate');
const crypto = require("crypto");
const VerificationCode = require("../models/verificationCodeSchema");
const bcrypt = require("bcrypt");

const sendEmail = async (email, type) => {
    let transporter;

    if (process.env.NODE_ENV !== 'production') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        })
    } else {
        AWS.config.update({
            accessKeyId: process.env.SES_ACCESS_KEY,
            secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
            region: 'eu-west-3'
        })

        transporter = nodemailer.createTransport({
            SES: new AWS.SES()
        });
    }

    await VerificationCode.findOneAndDelete({userEmail: email});

    let randomCode = crypto.randomInt(100000, 999999);

    const hashedCode = bcrypt.hashSync(randomCode.toString(), 10)

    await VerificationCode.create({userEmail: email, code: hashedCode});

    let emailTemplate;

    switch (type) {
        case 'email':
            emailTemplate = verifyEmail(email, randomCode.toString());
            break;
        case 'resetPassword':
            emailTemplate = passwordReset(email, randomCode.toString());
            break;
    }

    await transporter.sendMail(emailTemplate, (err) => {
        return !!err;
    });
}

module.exports = {sendEmail};