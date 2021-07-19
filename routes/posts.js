const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { postSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validatePost, confirmMessage } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Post = require('../models/posts');const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { cloudinary } = require("../cloudinary");


router.get('/',  catchAsync(async (req,res,next) => {
	/* const newPost = new Post({
		userName:"dharmi",
		title:"MSCRM",
		technology:"cloud",
		content:"dummy content"
	});
	newPost.save();
	console.log("Post saved successfully"); */
	if(req.query.q){
		console.log(req.query);
		const regex = new RegExp(req.query.q,'i') // i for case insensitive
        const posts = await Post.find({title: {$regex: regex}})
		console.log(posts); 
		if(posts.length==0){
			req.flash('error', 'Cannot find the result!');
			return res.redirect('/posts');
		}
		return res.render('posts/index',{posts:posts.reverse()});
	}
	const posts =  await Post.find();
	//const posts =  await Post.find({author: req.user._id});
	//console.log(posts);
	res.render('posts/index',{posts:posts.reverse()});
}));

router.get('/myposts', isLoggedIn, catchAsync(async(req,res,next) => {
	const posts =  await Post.find({author: req.user._id});
	//console.log(posts);
	//console.log(posts.reverse());
	res.render('posts/myposts',{posts:posts.reverse()});
	
}));

router.get('/new',isLoggedIn, (req,res)=>{
	res.render("posts/new");
});

router.post('/', isLoggedIn,upload.array('image'), validatePost,catchAsync(async (req,res,next) => {
	
	//console.log(req.body);
	const post = new Post(req.body.post);
	post.author = req.user._id;
	post.date = new Date().toJSON().slice(0,10).replace(/-/g,'-');
	post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
	//console.log(post.date);
	await post.save();
	req.flash('success', 'Successfully made a new Post');
	res.redirect(`/posts/${post._id}`)
	
}));

router.get('/:id',  catchAsync(async (req,res,next)=> {
	const {id} = req.params;
	const showpost = await Post.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //console.log(showpost);
	if (!showpost) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
   
	res.render("posts/show",{post:showpost})
}));





router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(async(req,res,next) => {
	

	 const showpost = await Post.findById(req.params.id);
	if(!showpost){
	req.flash('error', 'Cannot find that post!');
		return res.redirect('/posts');
	}
	res.render('posts/edit',{post:showpost});
	
}));

router.put('/:id',isLoggedIn, isAuthor, upload.array('image'), validatePost, catchAsync(async (req,res,next) => {
	const {id} = req.params;
	const updatedPost = await Post.findByIdAndUpdate(id, {...req.body.post});//spread operator
	const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedPost.images.push(...imgs);
    await updatedPost.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedPost.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
	   req.flash('success', 'Successfully updated post!');
	res.redirect(`/posts/${updatedPost._id}`);
}));

router.delete('/:id',isLoggedIn,isAuthor, catchAsync(async (req,res,next) => {
	const {id} = req.params;
	
	
	const deletedPost = await Post.findByIdAndDelete(id);
	console.log(deletedPost);
	for (let img of deletedPost.images) {
		 console.log(img.filename);
      await cloudinary.uploader.destroy(img.filename);
	
	}
	
	   req.flash('success', 'Successfully deleted Post');
	res.redirect("/posts");
	
}));


module.exports = router;
