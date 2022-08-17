const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (_id) => {
    jwt.sign(_id, process.env.SECRET, {expiresIn: '3d'});
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);

        const token = generateToken(user._id);

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const signupUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.signup(email, password);

        res.status(200).json({mssg: 'Sign up successfull'})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {signupUser, loginUser}