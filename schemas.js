const Joi = require('joi');
const { number } = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
       content: Joi.string().required(),
		// image : Joi.string().allow(""),
        technology: Joi.string().required()
        
        
		//content: Joi.number().required().min(0)
    }).required(),
	deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})