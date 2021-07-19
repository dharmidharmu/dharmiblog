const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
	name : String,
	job : String,
	gender : String,
	dob: Date,
	joinedon : Date
});

UserSchema.plugin(passportLocalMongoose);//create username and password fields

module.exports = mongoose.model('User', UserSchema);