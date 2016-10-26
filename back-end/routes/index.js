var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongoUrl = "mongodb://localhost:27017/legodb";
var User = require('../models/users');
mongoose.connect(mongoUrl);
//include bcrypt to store hashed pass
var bcrypt = require('bcrypt-nodejs');
var randToken = require('rand-token').uid;

router.post('/register', function(req, res, next) {

  	var token = randToken(32);
	var newUser = new User({
		fullname: req.body.fullname,
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password),
		email: req.body.email,
		token: token
	});

	newUser.save(function(error, user, documentAdded){
		console.log(error);
		console.log(user)
	});
	res.json({
		message: "added",
		token: token
	});
});

router.post('/login', function(req, res, next){
	User.findOne(
		{username: req.body.username},
		function(error, document){
			if(document == null){
				res.json({failure: "noUser"});
			}else{
				var loginResult = bcrypt.compareSync(req.body.password, document.password);
				
				if(loginResult){
					var token = randToken(32);
					res.json({
						success: "userfound",
						username: req.body.username,
						token: document.token
					});
				}else{
					res.json({
						failure: "badPass"
					});
				}
			}
		}
	)
});

router.get('/getUserData', function(req, res, next){
	var userToken = req.query.token;
	if(userToken == undefined){
		//No token was supplied
		res.json({failure: "noToken"});
	}else{
		User.findOne(
			{token: userToken},
			function(error, document){
				if(document == null){
					res.json({failure: 'badToken'});
				}else{
					res.json({
						fullname: document.fullname,
						username: document.username,
						email: document.email,
						token: document.token,
						sets: document.sets
					});
				}
			}
		)
	}
});

router.post('/addToCollection', function(req, res, next) {
	User.update(
		{token: req.body.token},
		{$push: {sets: req.body.results}},
		{multi: true},
		function(err, numberAffected){
			if(numberAffected.ok == 1){
				res.json({success: "updated"});
			}else{
				res.json({failure: "failedUpdate"});
			};
		}
	);
});

router.post('/removeFromCollection', function(req, res, next) {
	User.update(
		{token: req.body.token},
		{$pull: {sets: req.body.results}},
		{multi: true},
		function(err, numberAffected){
			if(numberAffected.ok == 1){
				res.json({success: "updated"});
			}else{
				res.json({failure: "failedUpdate"});
			};
		}
	);
});

router.post('/addPartsToCollection', function(req, res, next) {
	User.update(
		{token: req.body.token},
		{$push: {parts: req.body.parts}},
		{multi: true},
		function(err, numberAffected){
			if(numberAffected.ok == 1){
				res.json({success: "updated"});
			}else{
				res.json({failure: "failedUpdate"});
			};
		}
	);
});

router.post('/removePartsFromCollection', function(req, res, next) {
	User.update(
		{token: req.body.token},
		{$pullAll: {parts: req.body.parts}},
		{multi: true},
		function(err, numberAffected){
			if(numberAffected.ok == 1){
				res.json({success: "updated"});
			}else{
				res.json({failure: "failedUpdate"});
			};
		}
	);
});

module.exports = router;
