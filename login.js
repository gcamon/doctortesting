"use strict";
var LocalStrategy = require("passport-local").Strategy;
var path = require('path');
var config = require('./config');
var salt = require('./salt');
var router = config.router;
var passport = config.passport;

var loginRoute = function(model) {    
   passport.use('user-login', new LocalStrategy({
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

router.post('/user/login', passport.authenticate('user-login', {
  successRedirect : '/dashboard', // redirect to the secure profile section
  failureRedirect : '/failed', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/dashboard',function(req,res){
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
    res.redirect("/login");
  }  
});

router.get("/dashboard/patient",function(req,res){ 

  if(req.user){
    //getSocketInstance(req)
    res.render("patient",{"userInfo": req.user});
  } else {
    res.redirect('/login');
  }

});

//this router gets all the patient medical records and prescriptions and send it to the front end as soon as the patient logs in. 
  //the data is sent as json and the controller that receives it on the front end is "patientPanelController" .
  router.get("/patient-panel/get-medical-record",function(req,res){

    console.log("pppppppppppppppppppppppppppppppppppppppp");
    console.log(req.headers);      
    if(req.user) {
      model.user.findOne({user_id: req.user.user_id},{medical_records: 1,medications:1},function(err,data){
        if(err) throw err;          
        res.json({medical_records: data.medical_records,prescriptions: data.medications})
        //Note from model, medications holds all prescriptions while medical_records holds all laboratory and radiology tests
        // though there is prescription property on medical_record obj but not used yet.         
      });
    } else {
      res.end("Unauthorized access!!");
    }
  });


//user getting the available on the dashboard balance route.
  router.get('/dashboard/:userId/get-balance',function(req,res){
    console.log("pppppppppppppppppppppppppppppppppppppppp");
    console.log(req.headers)
    if(req.user){
      model.user.findOne({user_id: req.params.userId},{ewallet:1},function(err,wallet){
        if(err) throw err;
        res.send({balance: wallet.ewallet.available_amount})
      })
    } else {
      res.send("Unauthorized access!!!")
    }
  });



router.get('/failed',function(req,res){        
    res.send(false);
})


}

module.exports = loginRoute;