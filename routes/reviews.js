const express = require('express');

const Campground = require('../models/campground');
const Review = require('../models/review');

const isLoggedIn = require('../middlewares/isLoggedIn');
const doesReviewExist = require('../middlewares/doesReviewExist');
const isReviewOwner = require('../middlewares/isReviewOwner');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        options: {
            sort: {
                createdAt: -1,
            },
        },
    });

    if (!campground) {
        req.flash('error', 'Oops! Something went wrong.');
        return res.redirect('back');
    }

    res.render('reviews/index', { campground });
});

router.get('/new', isLoggedIn, doesReviewExist, async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    }

    res.render('reviews/new', { campground });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return Math.round(sum / reviews.length);
}

router.post('/', isLoggedIn, doesReviewExist, async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
        'reviews'
    );

    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('back');
    }

    const review = new Review(req.body.review);
    review.author.id = req.user._id;
    review.author.username = req.user.username;
    review.campground = campground;

    await review.save();
    campground.reviews.push(review);
    campground.rating = calculateAverage(campground.reviews);
    try {
        await campground.save();
        req.flash('success', 'Your review has been successfully added.');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

router.get('/:review_id/edit', isLoggedIn, isReviewOwner, async (req, res) => {
    const review = await Review.findById(req.params.review_id);

    if (!review) {
        req.flash(
            'error',
            "Sorry, couldn't find the review you were looking for."
        );
        res.redirect(`/campgrounds/${req.params.id}`);
    }

    res.render('reviews/edit', { review, campground_id: req.params.id });
});

router.put('/:review_id/', isLoggedIn, isReviewOwner, async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.review_id,
        req.body.review,
        { new: true }
    );

    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect('back');
    }

    const campground = await Campground.findById(req.params.id).populate(
        'reviews'
    );
    if (!campground) {
        req.flash('error', 'Could not find associated campground.');
        return res.redirect('back');
    }
    campground.rating = calculateAverage(campground.reviews);
    campground.save();

    req.flash('success', 'Your review was successfully edited.');
    res.redirect(`/campgrounds/${campground._id}`);
});

router.delete('/:review_id', isLoggedIn, isReviewOwner, async (req, res) => {
    await Review.findByIdAndDelete(req.params.review_id);
    const campground = await Campground.findByIdAndUpdate(
        req.params.id,
        { $pull: { reviews: req.params.review_id } },
        { new: true }
    ).populate('reviews');
    campground.rating = calculateAverage(campground.reviews);
    try {
        await campground.save();
        req.flash('success', 'Your review was successfully deleted!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

module.exports = router;
