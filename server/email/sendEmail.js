const AWS = require('aws-sdk');
const nodemailer = require("nodemailer");
const verifyEmail = require('./verifyEmail');

const sendEmail = async (code, email) => {
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



    await transporter.sendMail(verifyEmail(email, code));
}

module.exports = {sendEmail};