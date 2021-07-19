if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//Includes
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const Post = require('./models/posts');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { postSchema, reviewSchema } = require('./schemas.js');
const passport = require('passport');
const LocalStrategy =require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');

const posts = require('./routes/posts');
const reviews = require('./routes/reviews');
const users = require('./routes/users');
// const dbUrl = process.env.DB_URL;
// mongodb://localhost:27017/blogapp
mongoose.connect('mongodb://localhost:27017/blogapp', {
	useNewUrlParser : true,
	useCreateIndex : true,
	useUnifiedTopology : true,
	useFindAndModify: false // to remove findandupdate depreciation
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open",()=>{
	console.log("Database Connected");
});

//setters
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);


//use
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const store = new MongoStore({
	url : dbUrl,
	secret : 'thisshouldbeabettersecret',
	touchAfter:24*60*60
});

store.on("error", function(e) {
		 console.log("session store error");
		 });


//session and flash
const sessionConfig = {
	store,
	secret : 'thisshouldbeabettersecret',
	resave : false,
	saveUninitialized : true,
	cookie:{
		httpOnly : true,//cookie cannot access by client side for security
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // set the cookie expiration
		maxAge :1000 * 60 * 60 * 24 * 7
	}
	
}
app.use(session(sessionConfig));

app.use(flash());

//passport should be before session
app.use(passport.initialize());
app.use(passport.session());//for api calls also
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
	//console.log(req.session);
	console.log(req.user);
    res.locals.currentUser = req.user;
	
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/home', async(req, res) => {
	// await User.updateMany({},{$set :{joinedon : new Date().toJSON().slice(0,10).replace(/-/g,'-')}});
	
    res.render("home");
});





app.use('/posts', posts);
app.use('/posts/:id/reviews', reviews);
app.use('/',users);


app.get('/', (req, res) => {
    res.render("home");
});




app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});




app.listen(3000, () => {
	console.log("APP IS LISTENING");
});