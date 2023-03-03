const express = require('express');
const {
    changeEmailSendCode, changeEmailVerifyCode, changeEmailResendCode, resetPasswordSendCode, resetPasswordResendCode,
    resetPasswordVerifyCode, resetPasswordSetPassword, changeEmailVerifyPassword
} = require('../controllers/securityController');

const router = express.Router();

router.post('/reset-password/send-code', resetPasswordSendCode);
router.post('/forgot-password/resend-code', resetPasswordResendCode);
router.post('/forgot-password/verify-code', resetPasswordVerifyCode);
router.post('/forgot-password/set-password', resetPasswordSetPassword);

router.post('/change-email/verify-password', changeEmailVerifyPassword);
router.post('/change-email/send-code', changeEmailSendCode);
router.post('/change-email/verify-code', changeEmailVerifyCode);
router.post('/change-email/resend-code', changeEmailResendCode);

module.exports = router;