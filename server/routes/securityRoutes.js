const express = require('express');
const {
    changeEmailSendCode, changeEmailVerifyCode, changeEmailResendCode, resetPasswordSendCode, resetPasswordResendCode,
    resetPasswordVerifyCode, resetPasswordSetPassword, changeEmailVerifyPassword, registerVerifyCode, registerResendCode
} = require('../controllers/securityController');

const router = express.Router();

router.post('/reset-password/send-code', resetPasswordSendCode);
router.post('/reset-password/resend-code', resetPasswordResendCode);
router.post('/reset-password/verify-code', resetPasswordVerifyCode);
router.post('/reset-password/set-password', resetPasswordSetPassword);

router.post('/change-email/verify-password', changeEmailVerifyPassword);
router.post('/change-email/send-code', changeEmailSendCode);
router.post('/change-email/verify-code', changeEmailVerifyCode);
router.post('/change-email/resend-code', changeEmailResendCode);

router.post('/register/verify-code', registerVerifyCode);
router.post('/register/resend-code', registerResendCode);

module.exports = router;