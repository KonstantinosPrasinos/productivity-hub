const express = require('express');
const passport = require('passport');
const {
    signupUser, logoutUser, deleteUser, resetUser
} = require('../controllers/userController');

const router = express.Router();

router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err || !user) {
                return next(info);
            }

            req.logIn(user, function(err_login) {
                if (err_login) {
                    return next(err_login);
                }

                return next();
            })
        })(req, res, next);
    }, (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user));

        if (user && user.local.password) {
            delete user.local.password;
        }

        return res.status(200).json({user: {...user, googleLinked: false, active: undefined}});
    }
);

router.post('/google', function (req, res, next) {
        passport.authenticate('google-one-tap', function (err, user, info) {
            if (err || !user) {
                return next(info);
            }

            req.logIn(user, function(err_login) {
                if (err_login) {
                    return next(err_login);
                }

                return next();
            })
        })(req, res, next);
    }, (req, res) => {
        const user = JSON.parse(JSON.stringify(req.user))

        if (user && user.local.password) {
            delete user.local.password;
        }

        return res.status(200).json({user: {...user, googleLinked: true, active: undefined}});
    }
);

router.post('/signup', signupUser);
router.post('/logout', logoutUser);
router.post('/delete', deleteUser);
router.post('/reset', resetUser);

module.exports = router;