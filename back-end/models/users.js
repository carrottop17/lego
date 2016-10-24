var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	fullname: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true},
	email: {type: String, required: true},
	token: {type: String},
	tokenExpDate: Date,
	sets: [{set_id: String}]
});

module.exports = mongoose.model('User', userSchema);