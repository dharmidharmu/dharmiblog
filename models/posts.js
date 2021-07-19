const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const PostSchema = new Schema({
	title : String,
	technology : String,
	content : String,
	// image: String,
	images : [ImageSchema],
	date : Date,
	author : {
		type : Schema.Types.ObjectId,
		ref : 'User'
	},
	 reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

PostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

	


module.exports = mongoose.model('Post', PostSchema);