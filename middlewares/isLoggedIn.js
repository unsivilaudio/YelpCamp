module.exports = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You Must Be Logged In To Do That");
	res.redirect('/login');
}