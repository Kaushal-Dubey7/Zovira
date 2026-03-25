const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');

router.get('/', (req, res) => {
    let error = req.flash("error");
    res.render('main', { error, loggedin: false });
});
router.get('/start', (req, res) => {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render('index', { error, success, loggedin: false});
});

router.get('/shop', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    let products = await productModel.find();
    let success = req.flash("success");
    res.render('shop', { products, success, user });
});
router.get('/newCollection', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({email: req.user.email});
    res.render('collection',{user});
});
router.get('/men', isLoggedIn, async function (req, res) {
   let user = await userModel.findOne({ email: req.user.email });
    let products = await productModel.find();
    let success = req.flash("success");
    res.render('men', { user });
});
router.get('/women', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({email: req.user.email});
    res.render('women',{user});
});
router.get('/bags', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({email: req.user.email});
    res.render('bag',{user});
});
router.get('/cart', isLoggedIn, async function (req, res) {
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate('cart');
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/shop');
    }
    if (!user.cart || user.cart.length === 0) {
        return res.render('cart', { user, bill: 0 });
    }
    user = user.toObject(); // convert mongoose document to plain object
    user.cart = user.cart.map(item => {
        const finalPrice = (Number(item.price) + 20) - Number(item.discount);
        return Object.assign({}, item, {...item, finalPrice });
    });

    const bill = user.cart.reduce((sum, item) => sum + item.finalPrice, 0);
    res.render('cart', { user, bill});
});
router.get('/addtocart/:productid', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success", "Product added to cart successfully");
    res.redirect("/shop");
});
router.get('/addcart/:productid', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productid);
    await user.save();
    res.redirect("/cart");
});
router.get('/remove/:productid', isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    const index = user.cart.findIndex(id=>id.toString() === req.params.productid);
    if(index > -1){
        user.cart.splice(index,1);
        await user.save();
    }
    res.redirect("/cart");
});
router.get('/account', isLoggedIn, async function (req, res) {
    let user = await userModel
        .findOne({ email: req.user.email })
    res.render("account", { user })
});
router.get("/logout", isLoggedIn, (req, res) => {
    res.render("shop");
});

module.exports = router;