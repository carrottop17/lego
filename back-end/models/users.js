var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	fullname: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true},
	email: {type: String, required: true},
	token: {type: String},
	tokenExpDate: Date,
	sets: [
	{
		set_id: {type: String},
		year: {type: String},
		pieces: {type: String},
		theme1: {type: String},
		theme2: {type: String},
		theme3: {type: String},
		descr: {type: String},
		img_sm: {type: String},
	}],
	parts: {
		descr: {type: String},
		// parts: [
		// {
		// 	color_name: {type: String},
		// 	element_id: {type: String},
		// 	part_id: {type: String},
		// 	part_img_url: {type: String},
		// 	part_name: {type: String},
		// 	qty: {type: String}
		// }],
		set_id: {type: String}
	}
});

module.exports = mongoose.model('User', userSchema);