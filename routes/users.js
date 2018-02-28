var express = require('express');
var router = express.Router();


var User = require('../models/user');
// Require our controllers.
var user_controller = require('../controllers/userController');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// // GET users listing.
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// Register.
router.get('/register', function(req, res) {
  res.render('register');
});

// Login.
router.get('/login', function(req, res) {
  res.render('login');

});

router.post('/register', function(req, res) {
  var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

  // Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if(errors){
    console.log('place1');
		res.render('register',{
			errors:errors
		});
	} else {
    console.log('place3');
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

    User.createUser(newUser, function(err, user){
      console.log('place4');
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


router.post('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login'}),
  function(req, res) {
    req.flash('success_msg', 'You are successfully logged in');
    res.redirect('/');
  });

router.get('/logout', function(req, res){
  	req.logout();

  	req.flash('success_msg', 'You are logged out');

  	res.redirect('/users/login');
  });

  // GET request for User.
  router.get('/:id', user_controller.user_detail);

  // GET request to update user.
  router.get('/:id/update', user_controller.user_get);

  // POST request to update User.
  router.post('/:id/update', user_controller.user_post);


module.exports = router;