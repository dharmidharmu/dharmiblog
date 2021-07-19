const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Post = require('../models/posts');
const { isLoggedIn, noName, hasName, optionSetGender, optionSetJob} = require('../middleware');

router.get('/register', (req, res) => {
	if(req.user){
	req.flash('error', 'Log out from Current accunt and Try Again!');	
    return res.redirect('/userdetails');
	}
    res.render('users/register');
});


router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
		const userName = req.body.username;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
		await User.updateOne({username:userName},{$set :{joinedon : new Date().toJSON().slice(0,10).replace(/-/g,'-')}});
        req.login(registeredUser, err => {  //logged in the user
            if (err) return next(err);
            req.flash('success', 'Welcome to the Blog!');
            res.redirect('/skipuserdetails');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', async(req, res) => {
	if(!req.user){
    res.render('users/login');}
	else{
		
		
    res.redirect('/');
	}
	
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/posts'; //from middleware
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.post('/userdetails', isLoggedIn, noName,catchAsync(async(req,res) =>{
		   
	// console.log(req.user._id);
	// console.log(req.body.details);
	
	details = req.body.details;
	
	await User.updateOne({_id:req.user._id},{$set :details});
	const posts =  await Post.find({author: req.user._id});
	req.flash('success', 'Successfully Added the Info!');
	
	// console.log("updated");
	res.redirect('/userdetails');
	
                         
}));

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/posts');
});

router.get('/userdetails',isLoggedIn,catchAsync(async(req,res)=>{
	const posts =  await Post.find({author: req.user._id});
	res.render('users/userdetails',{posts:posts});
}));

router.get('/skipuserdetails',isLoggedIn,noName,(req,res)=>{
	res.render('users/skipuserdetails');
});

router.get('/edituserdetails',isLoggedIn,hasName,optionSetGender,optionSetJob, (req,res)=>{
	res.render('users/edituserdetails');
});

router.put('/userdetails',isLoggedIn, catchAsync(async(req,res)=>{
	details = req.body.details;
	
	await User.updateOne({_id:req.user._id},{$set :details});
	req.flash('success', 'Successfully Edited the Info!');
	res.redirect('/userdetails');
}));

router.get('/users/:name' ,isLoggedIn, catchAsync(async(req,res)=>{
	const {name} = req.params;
	const user = await User.find({username:name});
	if(user.length){
		const posts = await Post.find({author:user[0]._id});
		return res.render("users/user",{user:user[0],posts:posts});
		
	}
	req.flash('error', 'Could not find that user');
	res.redirect("/posts");
	
}));

module.exports = router;