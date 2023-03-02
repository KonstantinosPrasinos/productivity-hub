const express = require('express');
const passport = require('passport');
const {signupUser, logoutUser, deleteUser, changeEmail, forgotPasswordSendEmail,
    forgotPasswordSetPassword, resetUser
} = require('../controllers/userController');

const router = express.Router();

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user))

        if (user) {
            delete user.local.password;
        }

        return res.json({ user: user })
    }
)

router.post('/signup', signupUser);
router.post('/logout', logoutUser);
router.post('/delete', deleteUser);
router.post('/reset', resetUser);

module.exports = router;