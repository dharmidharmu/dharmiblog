const express = require('express');
const router = express.Router({ mergeParams: true });

const Post = require('../models/posts');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');





//Review Routes

router.post('/',isLoggedIn, validateReview, catchAsync(async (req, res,next) => {
    const post = await Post.findById(req.params.id);
    const review = new Review(req.body.review);
	 review.author = req.user._id;
    post.reviews.push(review);
    await review.save();
    await post.save();
	req.flash('success', 'Created new review!');
    res.redirect(`/posts/${post._id}`);
}));

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(async (req, res,next) => {
    const { id, reviewId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
	    req.flash('success', 'Successfully deleted review');
    res.redirect(`/posts/${id}`);
}));


module.exports = router;