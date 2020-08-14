const express = require('express');
const router = express.Router({ mergeParams: true });

const isLoggedIn = require('../middlewares/isLoggedIn');
const isCampgroundOwner = require('../middlewares/isCampgroundOwner');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const Review = require('../models/review');

router.get('/', function (req, res) {
  Campground.find({}, function (err, campgrounds) {
    if (err) {
      res.status(400).send('Oops something went wrong. :(');
    } else {
      res.render('campgrounds/index', { campgrounds: campgrounds });
    }
  });
});

router.get('/new', isLoggedIn, function (req, res) {
  res.render('campgrounds/new');
});

router.get('/:id', function (req, res) {
  Campground.findById(req.params.id)
    .populate('comments')
    .populate({
      path: 'reviews',
      options: {
        sort: {
          createdAt: -1,
        },
      },
    })
    .exec(function (err, camp) {
      err ? console.log(err) : res.render('campgrounds/show', { camp: camp });
    });
});

router.get('/:id/edit', isCampgroundOwner, function (req, res) {
  Campground.findById(req.params.id, function (err, camp) {
    err ? console.log(err) : res.render('campgrounds/edit', { camp: camp });
  });
});

router.put('/:id/', isCampgroundOwner, function (req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (
    err,
    camp
  ) {
    err
      ? res.redirect('/campgrounds')
      : res.redirect('/campgrounds/' + req.params.id);
  });
});

router.delete('/:id/', isCampgroundOwner, async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate('comments')
    .populate('reviews');
  if (!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  try {
    campground.comments.forEach((comment) =>
      Comment.findByIdAndRemove(comment.id)
    );
    campground.reviews.forEach((review) => Review.findByIdAndRemove(review.id));
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Campground successfully deleted!');
  } catch (err) {
    req.flash('error', 'Oops! Something went wrong.');
  }
  res.redirect('/campgrounds');
});

router.post('/', isLoggedIn, async function (req, res) {
  var { name, price, image, description } = req.body;
  var author = {
    id: req.user._id,
    username: req.user.username,
  };
  var campground = new Campground({
    name: name,
    price: price,
    image: image,
    description: description,
    author: author,
  });
  try {
    await campground.save();
    res.redirect('/campgrounds');
  } catch (e) {
    console.log(e);
    res.status(421).send('Oops, something went wrong');
  }
});

module.exports = router;
