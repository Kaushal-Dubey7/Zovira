const bcrypt = require("bcrypt");
const userModel = require('../models/user-model');
const jwt = require('jsonwebtoken');
const { generateToken } = require("../utils/generateToken");


module.exports.registerUser = async function (req, res) {
    try {
        let { email, password, fullname } = req.body;
        let user = await userModel.findOne({ email: email });
        if (user) {
            req.flash("error", "User with this email already exists,Please login");
            return res.redirect('/start');
        }
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);
                else {
                    let user = await userModel.create({
                        email,
                        password: hash,
                        fullname
                    });
                    let token = generateToken(user);
                    res.cookie('token', token);
                    req.flash("success", "User Registered Successfully,Please login");
                    return res.redirect('/start');
                }
            });
        });

    } catch (err) {
        res.status(500).send(err.message);
    }
};
module.exports.loginUser = async function (req, res) {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (!user) {
        req.flash("error", "Invalid Credentials");
        return res.redirect('/start');
    }
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = generateToken(user);
            res.cookie('token', token)
            res.redirect("/shop");
        } else {
            req.flash("error", "Invalid Credentials");
            return res.redirect('/start');
        }
    });
}
module.exports.logout = function (req, res) {
    res.cookie('token', "");
    res.redirect('/start');
};