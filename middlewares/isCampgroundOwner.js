const Campground = require("../models/campground");

module.exports = (req, res, next) => {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, function (err, foundCampground) {
			if (err || !foundCampground) {
				req.flash('error', "Whoops. Something went wrong :(");
				res.redirect('/campgrounds');
			}
			else if (foundCampground.author.id.equals(req.user._id)) {
				next();
			} else {
				req.flash('error', 'You don\'t have permission to do that!');
				res.redirect('back');
			}
		});
	} else {
		res.redirect('back');
	}
};