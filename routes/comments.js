const express = require('express');
const router = express.Router({ mergeParams: true });

const isLoggedIn = require('../middlewares/isLoggedIn');
const isCommentOwner = require('../middlewares/isCommentOwner');
const Comment = require('../models/comment');
const Campground = require('../models/campground');

router.get('/new', isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, camp) {
		err ? console.log(err) :
			res.render('comments/new', { campground: camp });
	});
});

router.post('/', isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, camp) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					camp.comments.push(comment);
					camp.save();
					req.flash('success', 'Successfully added a comment.');
					res.redirect(`/campgrounds/${ camp._id }`);
				}
			});
		}
	});
});

router.get('/:comment_id/edit', isCommentOwner, function (req, res) {
	Comment.findById(req.params.comment_id, function (err, foundComment) {
		console.log(foundComment);
		err ? res.redirect('back')
			: res.render('comments/edit', { campground_id: req.params.id, comment: foundComment });
	});
});

router.put('/:comment_id', isCommentOwner, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, comment) {
		if (err) {
			res.send('Oops. Something went wrong');
		} else {
			req.flash('success', 'Sucessfully edited your comment.');
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

router.delete('/:comment_id', isCommentOwner, function (req, res) {
	Comment.findByIdAndDelete(req.params.comment_id, function (err, comment) {
		err ? res.send('Oops. Something went wrong')
			: res.redirect('/campgrounds/' + req.params.id);
	});
});

module.exports = router;