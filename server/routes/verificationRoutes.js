const express = require('express');
const {verifyEmail, resendVerifyEmail} = require('../controllers/verificationController');

const router = express.Router();

router.post('/email', verifyEmail);
router.post('/resend-email', resendVerifyEmail);

module.exports = router;