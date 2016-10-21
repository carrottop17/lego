var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	fullname: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true},
	email: {type: String, required: true},
	token: {type: String},
	tokenExpDate: Date,
	name: String,
});

module.exports = mongoose.model('User', userSchema);