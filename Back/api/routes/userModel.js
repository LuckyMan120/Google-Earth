const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let db = require('../models');

router.route('/login').post((req, res) => {
	db.userDB.find({ email: req.body.email })
		.then(userData => {
			if (!userData[0]) {
				return res.json('User does not exist. Please try again!');
			}

			// Check password
			bcrypt.compare(req.body.password, userData[0].password).then(isMatch => {
				if (isMatch) {
					let payload = {
						user: userData[0]
					};

					// Sign Token
					jwt.sign(
			          	payload,
			          	process.env.secretKey,
			          	{
			            	expiresIn: 31556926 // 1 year in seconds
			          	},
			          	(err, token) => {
			            	res.json({
			              		success: true,
			              		token: "Bearer " + token
			            	});
			          	}
			        );
				} else {
					return res.json('Password does not match. Please enter correct password!');
				}
			});
		})
		.catch(err => console.log(err))
})

router.route('/autologin').post((req, res) => {
	db.userDB.find({ email: req.body.email })
		.then(result => {
			db.userDB.updateOne(
				{ _id: result[0]._id},
				{
				  $set: 
				  	{
				  		"active" : true
				  	}
				}
			).then(response => {
				result[0].active = true
				let payload = {
					user: result[0]
				}
				console.log(payload)
				// Sign Token
				jwt.sign(
		          	payload,
		          	process.env.secretKey,
		          	{
		            	expiresIn: 31556926 // 1 year in seconds
		          	},
		          	(err, token) => {
		            	res.json({
		              		success: true,
		              		token: "Bearer " + token
		            	});
		          	}
		        );
			})
			.catch(err => console.log('err', err));
		})
		.catch(err => console.log(err))
})

router.route('/register').post((req, res) => {
    const newUser = new db.userDB({
        email: req.body.email,
        password: req.body.password,
        imageInfo: req.body.imageInfo,
        role: 2,
        active: false
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
    	bcrypt.hash(newUser.password, salt, (err, hash) => {
        	if (err) throw err;
        	newUser.password = hash;
        	newUser.save()
        		.then(user => res.json("Add success!"))
        		.catch(err => console.log(err));
    	});
    });
})

router.route('/checkUser').post((req, res) => {
	db.userDB.find({ email: req.body.email })
		.then(result => {
			if (!result[0]) {
				res.json(false)
			} else {
				res.json(true)
			}
		})
		.catch(err => console.log(err))
})

router.route('/resetPassword').put((req, res) => {
	db.userDB.find({ email: req.body.email })
		.then(result => {
			// Hash password before saving in database
		    bcrypt.genSalt(10, (err, salt) => {
		    	bcrypt.hash(req.body.password, salt, (err, hash) => {
		        	if (err) throw err;
		        	
		        	db.userDB.updateOne(
						{ _id: result[0]._id},
						{
						  $set: 
						  	{
						  		"password" : hash
						  	}
						}
					).then(() => {
						res.json(true)
					})
					.catch(err => console.log('err', err));
		    	});
		    });


		})
		.catch(err => console.log(err))
})

module.exports = router;