const express = require('express');
const router = express.Router({ mergeParams: true });

const isLoggedIn = require('../middlewares/isLoggedIn');
const isCampgroundOwner = require('../middlewares/isCampgroundOwner');
const Campground = require('../models/campground');

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
	Campground.findById(req.params.id).populate("comments").exec(function (err, camp) {
		err ? console.log(err) :
			res.render('campgrounds/show', { camp: camp });
	});
});

router.get('/:id/edit', isCampgroundOwner, function (req, res) {
	Campground.findById(req.params.id, function (err, camp) {
		err ? console.log(err)
			: res.render('campgrounds/edit', { camp: camp });
	});
});

router.put('/:id/', isCampgroundOwner, function (req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, camp) {
		err ? res.redirect('/campgrounds')
			: res.redirect('/campgrounds/' + req.params.id);
	});
});

router.delete('/:id/', isCampgroundOwner, function (req, res) {
	Campground.findByIdAndRemove(req.params.id, function (err) {
		err ? console.log(err) :
			res.redirect('/campgrounds');
	});
});

router.post('/', isLoggedIn, async function (req, res) {
	var { name, price, image, description } = req.body;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var campground = new Campground({ name: name, price: price, image: image, description: description, author: author });
	try {
		await campground.save();
		res.redirect('/campgrounds');
	} catch (e) {
		console.log(e); res.status(421).send('Oops, something went wrong');
	}
});



module.exports = router;
