"use strict";
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var path = require('path');
var config = require('./config');
var salt = require('./salt');
var router = config.router;



var loginRoute = function(model) {    
   passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
            

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        model.user.findOne({ email :  email }, function(err, user) {
            
            // if there are any errors, return the error before anything else
            if (err) {
                return done(err);
            }
            // if no user is found, return the message
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!salt.isValidPassword(user,password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
            
            // all is well, return successful user
            return done(null, user);
        });

    }));

router.post('/user/login', passport.authenticate('login', {
  successRedirect : '/success', // redirect to the secure profile section
  failureRedirect : '/failed', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/success',function(req,res){
  if(req.user){ 
   model.user.findOne({user_id: req.user.user_id},{presence:1,set_presence:1}).exec(function(err,data){
    data.presence = true;
    data.set_presence.general = true;
    data.save(function(err,info){
      console.log("presence is true");
    });
   });           
   res.json({
      isLoggedIn: true,
      typeOfUser: req.user.type,
      firstname: req.user.firstname,
      lastname:req.user.lastname,
      phone: req.user.phone,
      email: req.user.email,
      title: req.user.title,
      user_id: req.user.user_id,
      balance: req.user.ewallet.available_amount,
      profile_pic_url: req.user.profile_pic_url
      });
  } else {
    res.render("success",{"message":""});
  }  
});

//user requesting login page.
router.get('/login',function(req,res){
  res.render("success",{"message":""})
});

router.get('/failed',function(req,res){        
    res.send(false);
})


}

module.exports = loginRoute;