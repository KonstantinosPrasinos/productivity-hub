const express = require('express');
const passport = require('passport');
const {signupUser, logoutUser, deleteUser, resetUser
} = require('../controllers/userController');

const router = express.Router();

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user))

        if (user && user.local.password) {
            delete user.local.password;
        }

        return res.json({ user: user })
    }
)

router.post(
    "/google",
    passport.authenticate(
        "google-one-tap",
    ),
    (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user));

        if (user && user.local.password) {
            delete user.local.password;
        }

        return res.json({ user: user })
    }
);

router.post('/signup', signupUser);
router.post('/logout', logoutUser);
router.post('/delete', deleteUser);
router.post('/reset', resetUser);

module.exports = router;