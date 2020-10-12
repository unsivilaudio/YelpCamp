const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id)
            .populate('reviews')
            .exec(function (err, foundCampground) {
                if (err || !foundCampground) {
                    req.flash('error', 'Campground not found.');
                    res.redirect('back');
                } else {
                    // check if req.user._id exists in foundCampground.reviews
                    var foundUserReview = foundCampground.reviews.some(
                        function (review) {
                            return review.author.id.equals(req.user._id);
                        }
                    );
                    if (foundUserReview) {
                        req.flash('error', 'You already wrote a review.');
                        return res.redirect(
                            '/campgrounds/' + foundCampground._id
                        );
                    }
                    // if the review was not found, go to the next middleware
                    next();
                }
            });
    } else {
        req.flash('error', 'You need to login first.');
        res.redirect('back');
    }
};
