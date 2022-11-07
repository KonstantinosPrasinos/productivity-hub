const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const verifyEmail = require('./verifyEmail');

AWS.config.update({
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    region: 'eu-west-3'
})

const sendEmail = async (code, email) => {
    let transporter = nodemailer.createTransport({
        SES: new AWS.SES()
    });

    await transporter.sendMail(verifyEmail(email, code));
}

module.exports = {sendEmail};