const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user');

router.get('/', function (req, res) {
	res.render('landing');
});

router.get('/register', function (req, res) {
	res.render('register');
});

router.post('/register', function (req, res) {
	const { username, password } = req.body;
	User.register(new User({ username: username }), password, function (err, user) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function () {
			req.flash("success", `Welcome to YelpCamp ${ user.username }`);
			res.redirect('/campgrounds');
		});
	});
});

router.get('/login', function (req, res) {
	res.render('login');
});

router.post('/login', passport.authenticate(
	'local', {
	successRedirect: '/campgrounds',
	failureRedirect: '/login'
}), function (req, res) {
});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash("success", "Logged You Out!");
	res.redirect('/campgrounds');
});

module.exports = router;