const express = require('express');
const passport = require('passport');
const {signupUser, logoutUser} = require('../controllers/userController');

const router = express.Router();

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user))

        if (user) {
            delete user.password
        }

        return res.json({ user: user })
    }
)

router.post('/signup', signupUser);
router.post('/logout', logoutUser);

module.exports = router;