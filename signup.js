"use strict";
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var path = require('path');
var chance = require("chance").Chance();
var config = require('./config');
var salt = require('./salt');
var router = config.router;
var http = require("http");



var signupRoute = function(model,sms) {
	passport.use('signup', new LocalStrategy({
		usernameField : 'email',
	    passwordField : 'password',
	    passReqToCallback : true 
	},
	function(req,email,password,done){
		process.nextTick(function(){	
			model.user.findOne({email:email},function(err,user){
				if(err) return done(err);
				if(user){
					return done(null, false, req.flash('signupMessage', 'That email has already been use please find another one'));	
				} else {
					if(req.body.agree === true) {			
						
						var uid = genId(req.body.email);
						var referrral_link = "/referral/" + uid + "/signup";											
						var User = new model.user({
						email: email,
						user_id: uid,
            password: salt.createHash(password),
            phone: req.body.phone,
            admin: false,
            type: req.body.typeOfUser,
            city: req.body.city,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
			address: req.body.address,
			gender: req.body.gender,
			title: req.body.title,
			age: req.body.age,
			profile_pic: {
				filename:""
			},
			specialty: req.body.specialty,
			profile_url: "/ranking/views/" + uid,
			profile_pic_url: "/download/profile_pic/nopic",
			work_place: req.body.work_place,
			country: req.body.country,
			name: req.body.name,
			verified: false,
			ref_link: referrral_link					
			});

			if(req.body.typeOfUser === "Doctor"){
				User.name = "Dr " + req.body.firstname + " " + req.body.lastname.slice(0,1).toUpperCase();
			}

			User.ewallet = {
				available_amount: 0,
				firstname: req.body.firstname,
    			lastname: req.body.lastname,
			}


					User.save(function(err){
						console.log("user saved");
						if(err) throw err;					
						return done(null,User);
					})
				} else {
					return done(null, false, req.flash('signupMessage', 'Please you have to agree to our terms and conditions'))
				}
			}
			})

			function genId(userId) {
				var getRandomNumber = Math.floor(Math.random() * 199999999);
				return getRandomNumber;
			}
		})
	}));
	

	router.post('/user/signup', function(req, res, next) {    
	  passport.authenticate('signup', function(err, user, info) {
	    if (err) {
	      return next(err); // will generate a 500 error
	    }
	    // Generate a JSON response reflecting signup
	    if (!user) {	
	      	res.send({error:true,errorMsg: "User with that email already exist!"});
	    } else {	    	
	    	res.send({error: false});
	    }

	  })(req, res, next);
	});


	router.post("/referral/:id/signup",function(req,res){
		passport.authenticate('signup', function(err, user, info) {
	    if (err) {
	      return next(err); // will generate a 500 error
	    }
	    // Generate a JSON response reflecting signup
	    if (!user) {	
	      	res.send({error:true,errorMsg: "User with that email already exist!"});
	    } else {
	    	model.user.findOne({user_id: req.params.id},{ewallet:1}).exec(function(err,data){
	    		if (err) throw err;
	    		var date = + new Date();	    		
	    		var transacObj = {
						date: date,
						source: "Admin",
						actiivity: "Credit",
						message: "referral commission",
						body: {
							amount: 100,
							beneficiary: "You"
						}
					}
					data.ewallet.available_amount += 100;
					data.ewallet.transaction.push(transacObj);
	    		data.save(function(err,info){
	    			if(err) throw err;
 	    			console.log("referral commission given");
	    		});
	    	})	    	
	    	res.send({error: false});
	    }

	  })(req, res, next);
	});

	router.post("/user/emergency-signup",function(req, res, next) {
		console.log(req.body)
		model.user.findOne({phone:req.body.phone},function(err,user){			
			if(err) throw err;
			if(user){
				res.json({message: "User with this phone number " + "'" + req.body.phone + "'" + " already exist"})
			} else {
				var ref = Math.floor(Math.random() * 99999999);
				var uid = genId();
				var profileUrl = "/patient/EM/profile/" + uid;				
				var User = new model.user({
					email: req.body.email,
					user_id: uid,
				    phone: req.body.phone,	                    
				    type: req.body.typeOfUser,
				    city: req.body.city,
				    firstname: req.body.firstname,
				    lastname: req.body.lastname,
				    username: req.body.username,
					address: req.body.address,		
					profile_pic_url: "/download/profile_pic/nopic",						
					country: req.body.country,
					emergency_ref_url: profileUrl									
				});
				
				var patient = {
					patient_firstname:req.body.firstname,
					patient_lastname:req.body.lastname,
					patient_id: uid,
					patient_profile_pic_url:User.profile_pic_url,
					date: req.body.date
				}
			  
			  User.save(function(err,info){			  	
			  	if(err) throw err;  	
			  	sendSMS(req.body.phone,profileUrl);
			  	if(req.body.email)
			  		sendEMAIL(req.body.email)	

			  	switch(req.body.type){
			  		case "doctor":
			  			tellDoctor(patient);
			  		break;

			  		case "laboratory":
			  			patient.ref = ref;
			  			patient.status = "em";
			  			tellCenter(patient);
			  		break;

			  		case "radiology":
			  			patient.ref = ref;
			  			patient.status = "em";
			  			tellCenter(patient);
			  		break;

			  		default:
			  		break;
			  	}

			  	console.log(patient)
			  	
			  })

			  
			}
		})

		//importantly, sms or email if available will be sent to patient including the referrral link for the patiento view his profile.
		function sendSMS(mobile,profileUrl){

			var msgBody = "Your emergency profile link is \n" + profileUrl;
			var phoneNunber = "234" + mobile;
			sms.message.sendSms('Appclinic',phoneNunber,msgBody,callBack); //"2348096461927"
			
		}

		function sendEMAIL(email){
			
		}
		
		function tellDoctor(patientObj) {
			model.user.findOne({user_id: req.user.user_id},{doctor_patients_list:1}).exec(function(err,data){
				if(err) throw err;
				data.doctor_patients_list.unshift(patientObj);
				data.save(function(err,info){
					if(err) throw err;
					res.send(patientObj)
				})
			})		
		}

		function tellCenter(patientObj) {
			model.user.findOne({user_id: req.user.user_id},{referral:1}).exec(function(err,result){
				if(err) throw err;
				try{
				var centerObj = {
	        name: req.user.name,
	        address: req.user.address,
	        city: req.user.city,
	        country: req.user.country,
	        phone: req.user.phone,
	        id: req.user.user_id
        }

				var refObj = {};
				refObj.ref_id = patientObj.ref,
	      refObj.referral_firstname = req.user.name;
	      refObj.referral_lastname = req.user.lastname;
	      refObj.referral_title = req.user.title;
	      refObj.referral_id = req.user.user_id;  
	      refObj.date = req.body.date;

	      if(req.body.type === "laboratory") {
		      refObj.laboratory = {
		      	test_to_run : [],
		        patient_firstname: req.body.firstname,
		        patient_lastname: req.body.lastname,
		        patient_profile_pic_url: patientObj.patient_profile_pic_url,
		        patient_title: req.body.title,
		        patient_gender: req.body.gender,
		        patient_age: req.body.age,
		        patient_phone: req.body.phone,
		        patient_id: patientObj.patient_id,
		        attended: false
		      }
	    	} else if(req.body.type === "radiology"){
	    		refObj.radiology = {
		      	test_to_run : [],
		        patient_firstname: req.body.firstname,
		        patient_lastname: req.body.lastname,
		        patient_profile_pic_url: patientObj.patient_profile_pic_url,
		        patient_title: req.body.title,
		        patient_gender: req.body.gender,
		        patient_age: req.body.age,
		        patient_phone: req.body.phone,
		        patient_id: patientObj.patient_id,
		        attended: false
		      }
	    	}

	      result.referral.push(refObj);          

        result.save(function(err,info){
          if(err) throw err;
          res.send(patientObj)
        });

        tellPatient(centerObj,patientObj.patient_id,patientObj.ref);
      } catch(e){
      	console.log(e.message)
      }

			})
			
			var tellPatient = function(centerInfo,patient_id,ref){
        //remember sms will be sent to the patient
        model.user.findOne({user_id: patient_id},{medical_records: 1,user_id:1}).exec(function(err,record){            
          if(err) throw err;     
          var recordObj = {
            center_name: centerInfo.name,
            test_to_run: [],
            center_address: centerInfo.address,
            center_city: centerInfo.city,
            center_country: centerInfo.country,
            center_phone: centerInfo.phone,
            center_id: centerInfo.id,
            patient_id: record.user_id,
            ref_id: ref,
            referral_firstname: centerInfo.name,
            referral_lastname: req.user.lastname,
            referral_title: req.user.title,
            sent_date: req.body.date,
            report: "Pending",
            conclusion: "Pending"
          }

          switch(req.body.type){
          	case "laboratory":
          		record.medical_records.laboratory_test.unshift(recordObj);
          	break;
          	case "radiology":
          		record.medical_records.radiology_test.unshift(recordObj);
          	break;
          	default:
          	break;
          }
          
          record.save(function(err,info){
            if(err) {
              throw err;
              res.end('500: Internal server error')
            }
            console.log(recordObj)   
          });

        });
      }//end of tellpatient function
		} //end of tellcenter function
		
	 
	  function genId() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899966600555777222";

	    for( var i=0; i < 12; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
		}
	  
	});

	
 
}

module.exports = signupRoute;