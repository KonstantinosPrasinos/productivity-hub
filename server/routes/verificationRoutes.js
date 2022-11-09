const express = require('express');
const {verifyEmail, resendVerifyEmail, verifyForgotPassword} = require('../controllers/verificationController');

const router = express.Router();

router.post('/email', verifyEmail);
router.post('/resend-email', resendVerifyEmail);
router.post('/forgot-password', verifyForgotPassword)

module.exports = router;