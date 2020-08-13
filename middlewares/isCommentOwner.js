const Comment = require('../models/comment');

module.exports = (req, res, next) => {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function (err, foundComment) {
			err ? res.redirect('/campgrounds')
				: (foundComment.author.id.equals(req.user._id))
					? next()
					: function () {
						req.flash('error', 'You don\'t have permission to do that!');
						res.redirect('back');
					};
		});
	} else {
		res.redirect('back');
	}
};