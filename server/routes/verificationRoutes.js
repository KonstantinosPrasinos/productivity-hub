const express = require('express');
const {verifyEmail, resendVerifyEmail, verifyForgotPassword, resendForgotPasswordEmail} = require('../controllers/verificationController');

const router = express.Router();

router.post('/email', verifyEmail);
router.post('/email/resend', resendVerifyEmail);
router.post('/forgot-password', verifyForgotPassword);
router.post('/forgot-password/resend', resendForgotPasswordEmail)

module.exports = router;