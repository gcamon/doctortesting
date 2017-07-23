"use strict";
var config = require('./config');
var salt = require('./salt');
var router = config.router;
var http = require("http");
var path = require("path");
var Wallet = require("./wallet");


var basicPaymentRoute = function(model,sms,io){

	//this route creates the token for use ie creating vouchers
	router.post("/user/token",function(req,res){
		if(req.user && req.user.admin !== true){
			model.pins.findOne({}).exec(function(err,data){
				if(err) throw err;
				if(!data){
					var Pins = new model.pins({
						voucher: []
					});
					Pins.save(function(err,info){
						console.log("pins initialized");
						res.send('Vouchers initilized! Please resend to print vouchers.')
					});

				} else {

					switch(req.body.grade){
						case 100000:
							printPins("11");
						break;
						case 50000:
							printPins("05");
						break;
						case 20000:
							printPins("02");
						break;
						case 10000:
							printPins("01");
						break;
						case 5000:
							printPins("50");
						break;
						case 1000:
							printPins("10");
						break;
						default:
						break;
					}

					data.save(function(err,info){
						if(err) throw err;
						console.log("vouchers printed!");
						console.log(info)
						var detail = req.body.quantity + " new vouchers printed! \ntotal vouchers  printed so far is " + info.length;
						res.send(detail)
					});
				}

				function printPins(grade) {
					var quantity = 0;
					while(req.body.quantity > quantity) {
						var random1 = Math.floor(Math.random() * 99);
						var random2 = Math.floor(Math.random() * 9999);
						var random3 = Math.floor(Math.random() * 9999);
						var random4 = Math.floor(Math.random() * 9999);
						var valObj = {};
						valObj.din = req.body.grade;
						valObj.pin = grade + check(random1,false) + " " + check(random2) + " " + check(random3) + " " + check(random4);
						data.voucher.push(valObj);
						quantity++;
					}
					 console.log(data.voucher)
				}

				//completes number to four digits if is less.
				function check(num,param) {
					var toStr = num.toString();  
				  if(toStr.length < 4 && param === undefined) {
				    for( var i = toStr.length - 1; i < 3; i++){
				      toStr+= 0;
				    }
				  } else {
				  	if(toStr.length < 2 && param === false) {
					    for( var i = toStr.length - 1; i < 1; i++){
					      toStr+= 0;
					    }
					  }
				  }
				  return toStr;
				}
				
			});

		} else {
			res.end("unathorized access!!!");
		}
	});
	
	router.post("/user/admin/view-vouchers",function(req,res){
		if(req.user && req.user.admin === true){
			model.user.findOne({username: req.query.userId,password: req.query.password},function(err,user){
				if(err) throw err;
				if(!user){
					res.end("You have no permission to view this page.");
				} else {
					model.pins.findOne({},function(err,data){
						if(err) throw err;
						res.render("vouchers",{pin: data.voucher})
					});
				}
			});

		} else {
			res.send("Unauthorized access!!")
		}
	});


	//this route takes care of account top up from users using voucher or pin numbers 
	//nite req will carry date, message, pin number
	router.put("/user/account/pin-top-up",function(req,res){
		console.log(req.body)
		if(req.user) {
			model.pins.update({"voucher.pin": req.body.pin}, {$unset: {"voucher.$": 1}},function(err,info){
				if(err) throw err;
				if(info.nModified === 1 && info.n === 1) {
					creditUser()
				} else {
					res.send({error: "Sorry! This pin does not exist or has already been used!"})
				}
			});

			function creditUser() {
				model.user.findOne({user_id:req.user.user_id},{firstname:1,lastname:1,user_id:1,ewallet:1},function(err,data){
						if(err) throw err;
						var amount;
						var grade = req.body.pin.slice(0,2);
						switch(grade){
							case "11":
								amount = 100000;
							break;
							case "05":
								amount = 50000;
							break;
							case "02":
								amount = 20000;
							break;
							case "01":
								amount = 10000;
							break;
							case "50":
								amount = 5000;
							break;
							case "10":
								amount = 1000;
							break;
							default:
							break;
						}
						data.ewallet.available_amount += amount;
						var name = data.firstname + " " + data.lastname;		
						var transacObj = {
							date: req.body.date,
							source: name,
							activity: "Account funding",
							message: req.body.message,
							body: {
								amount: amount,
								beneficiary: "You"
							}
						}

						data.ewallet.transaction.push(transacObj);
						data.save(function(err,info){
							if(err) throw err;
							console.log("saved");
							
						});
						res.send({success:"Account credited successfully!",balance: data.ewallet.available_amount});
					});

			}
		} else {
			res.render("success");
		}

	});

	//this route takes care of admin crediting user after payment deposit is confirmed. 
	router.put("/user/account/top-up",function(req,res){
		if(req.user && req.user.admin === true){
			model.user.findOne({user_id:req.user.user_id},{firstname:1,lastname:1,user_id:1},function(err,data){				
				if(err){
					res.send("Error occured! account not credited!");
				} else {
					var reciever = (req.body.phone !== undefined || req.body.user_id !== undefined) ? checkReceiver() : {user_id: data.user_id};
					var pay = new Wallet(req.body.date,data.firstname,data.lastname,req.body.message);
					pay.credit(model,reciever,req.body.amount);
					
					function checkReceiver(){
						return (req.body.phone !== undefined) ? {phone: req.body.phone} : {user_id: req.body.user_id};
					}
					res.send("Account credited successfully!!");
				}				
			});		
		} else {
			res.end("unathorized access!");
		}
	});


	router.get("/user/verify",function(req,res){
		if(req.user && req.query.phone || req.query.userId){
			console.log(req.query)
			var obj;
			if(req.query.phone){
				var toNum = parseInt(req.query.phone)
				obj = {phone: toNum}
			} else if(req.query.userId){
				obj = {user_id: req.query.userId}
			}

			model.user.findOne(obj,{user_id:1,firstname:1,lastname:1,name:1,_id:0},function(err,user){
				if(err) throw err;
				if(!user){
					var person = req.query.phone || req.query.userId;
					var msg = "User with this " + person + " does not exist";
					res.send({error: msg})
				} else {
					console.log(user);
					res.send(user);
				}
				
			})
		} else {
			res.send({error: "Incomplete transaction!"});
		}
	});

	router.post("/user/payment/verification",function(req,res){

		if(req.user && req.body.userId !== req.user.user_id){
			//generate otp for confirmation. the debitor's id is sent from the request including the amount.
			//request is obj of the debitor's id, amount to debit ie the person paying for the service.
			//note for payment req.body must have userId of who is to be debited is required while for transfer req.body do not have userId
			//because is assumed the user at that moment is making the request which means his req.user.user_id will be used.
			var personId = req.body.userId || req.user.user_id;

			model.user.findOne({user_id: personId},{phone:1,ewallet:1,user_id:1},function(err,user){
				if(err) throw err;
				if(!user){
					res.send({message: "User does not exist!"});
				} else {
					if(user.ewallet.available_amount >= req.body.amount){
						var random1 = Math.floor(Math.random() * 999);
						var random2 = Math.floor(Math.random() * 999);
						var password = check(random1) + " " + check(random2);

						if(req.body.old_time){ //checks if otp was resend therefore removes the old otp which will not be in use anymore.
							model.otpSchema.remove({time:req.body.old_time},function(err){
								if(err) throw err;
							});
						}

						/*var verify = {
							user_id: user.user_id,//this refers to the id of the debitor. ie the person otp will be sent to.
							otp: password,
							amount: req.body.amount,
							time: req.body.time
						}*/
						
						
			      var otp = new model.otpSchema({
			        user_id: user.user_id,//this id refers to the debitors id. the person whose account will be debited.
			        time: req.body.time,
			        otp: password,
			        amount: req.body.amount,
			        senderId: req.user.user_id
			      });
			      

			      //sets the expiration time for each otp sent.
			      var date = new Date();
			      otp.expirationDate = new Date(date.getTime() + 300000);
			      otp.expirationDate.expires = 300;
			      console.log(otp);

			      otp.save(function(err,info){
			        if(err) throw err;
			        console.log("otp saved");
			      }); 


			      var callBack = function(err,responseData){
							if(err) console.log(err);
							console.log(responseData);
						}

						var msgBody = "Your payment OTP is " + password + " \nPlease disclose only to the right user."
						var phoneNunber = "234" + user.phone;
						sms.message.sendSms('Appclinic',phoneNunber,msgBody,callBack); //"2348096461927"

						res.send({message:"One time pin number has been sent. The pin is needed for payment confirmation",success:true,time_stamp:req.body.time}) 

					} else {
						res.send({message: 'Transaction failed! Reason: The person to debit has insufficient fund for the service!'});
					}   

					function check(num) {
						var toStr = num.toString();  
					  if(toStr.length < 3) {
					    for( var i = toStr.length - 1; i < 2; i++){
					      toStr+= 0;
					    }
					  } 
					  return toStr; 
				  }
				 }

				})

		} else {
			res.send({message: "Unathorized transaction"});
		}

	});

	//this route debits and credits both parties.
	//@params object. properties otp,date,message,userId
	//this route will be used by diagnostic centers, special centers, hospitals, pharmcy for payment confirmation.
	router.post("/user/payment/confirmation",function(req,res){
		if(req.user && req.body && req.body.userId !== req.user.user_id && req.body.otp){
			model.otpSchema.findOne({otp:req.body.otp}).exec(function(err,data){
				if(err) throw err;
				
				if(!data){
					res.send({message:"Confirmation failed! Transaction canceled."})
					data.save(function(err,info){
						if(err) throw err;
					});
				} else {						
					//check is is the right otp for a user
					if(data.user_id === req.body.userId && data.senderId === req.user.user_id) {
						delete data.otp;
						//do the actual transaction. success!
						model.user.findOne({user_id: req.body.userId},{ewallet:1,firstname:1,lastname:1,name:1}).exec(function(err,debitor){
							var name = req.user.firstname || req.user.name;
							var pay = new Wallet(req.body.date,name,req.user.lastname,req.body.message);
							//note firstname or lastname of patient may change.
							pay.payment(model,data.amount,debitor,req.user.user_id);
							res.send({message: "Transaction successful! Your account is credited."});
						});						
						data.save(function(err,info){
							if(err) throw err;
						});
					} else {
						res.send({message: "This OTP is not for this user"});
						data.save(function(err,info){
							if(err) throw err;
						});
					}
				}
			})
		} else {
			res.send({message: "Unathorized transaction"});
		}
	});

	//@params object. properties otp,date,message,userId or phone
	router.post("/user/tranfer/confirmation",function(req,res){
		if(req.user && req.body && req.body.userId !== req.user.user_id && req.body.otp && req.body.phone !== req.user.phone){
			model.otpSchema.findOne({otp:req.body.otp}).exec(function(err,data){
				if(err) throw err;
				if(!data){
					res.send({message:"Confirmation failed! Transaction canceled."});
					data.save(function(err,info){
						if(err) throw err;
					});
				} else {					
					//check is the right otp for a user
					if(data.user_id === req.user.user_id) {
						delete data.otp;
						//do the actual transaction. success!
						var receiver;	
						if(req.body.phone){
							receiver = {phone: req.body.phone}
						} else if(req.body.userId){
							receiver = {user_id: req.body.userId}
						}

						model.user.findOne(receiver,{firstname:1,lastname:1,name:1},function(err,creditor){
							if(err) throw err;
							if(creditor) {
								transact(creditor);								
							} else {
								res.send({message: "Transaction cancelled! Reason: User does not exist."});
							}
						});

						function transact(person){
							model.user.findOne({user_id: req.user.user_id},{ewallet:1,firstname:1,lastname:1,name:1}).exec(function(err,debitor){
								var name = req.user.firstname || req.user.name;
								var pay = new Wallet(req.body.date,name,debitor.lastname,req.body.message);
								//note firstname or lastname of patient may change.							
								pay.transfer(model,data.amount,debitor,receiver,person);
								res.send({message: "Transaction successful! Your account is debited.",balance:debitor.ewallet.available_amount});
							});
						}	

						data.save(function(err,info){
							if(err) throw err;
						});
					} else {
						res.send({message: "This OTP is not for this user"});
						data.save(function(err,info){
							if(err) throw err;
						});
					}
				}
			})
		} else {
			res.send({message: "Error: Incomplete transaction"});
		}
	});

	/*this route handles the patient accepting consultation fee. the patient wallet will be debited and doctor's wallet credited slightly*/
	
	router.post("/user/patient/consultation-acceptance/confirmation",function(req,res){
		console.log(req.body)
		if(req.user && req.body && req.body.userId !== req.user.user_id && req.body.otp && req.user.type === "Patient"){
			model.otpSchema.findOne({otp:req.body.otp}).exec(function(err,data){
				if(err) throw err;
				
				if(!data){
					res.send({message:"Confirmation failed! Transaction canceled."})
					data.save(function(err,info){
						if(err) throw err;
					});
				} else {					
					//check is is the right otp for a user
					if(data.user_id === req.user.user_id) {
						delete data.otp;
						//do the actual transaction. success!
						model.user.findOne({user_id: req.user.user_id},{ewallet:1,firstname:1,lastname:1,name:1}).exec(function(err,debitor){
							var name = req.user.firstname || req.user.name;
							var pay = new Wallet(req.body.date,name,req.user.lastname,req.body.message);
							//note firstname or lastname of patient may change.
							pay.consultation(model,data.amount,debitor,req.body.userId);
							createConnection(debitor);
						});						
						data.save(function(err,info){
							if(err) throw err;
						});
					} else {
						res.send({message: "This OTP is not for this user"});
						data.save(function(err,info){
							if(err) throw err;
						});
					}
				}
			})
		
			function createConnection(debitor){
				var DocObj = {					
					doctor_id: req.body.sendObj.user_id,
					date_of_acceptance: req.body.sendObj.date_of_acceptance,
					doctor_firstname: req.body.sendObj.firstname,
					doctor_lastname:  req.body.sendObj.lastname,
					doctor_name: req.body.sendObj.name,
					doctor_profile_pic_url: req.body.sendObj.profile_pic_url,
					service_access: true,
					doctor_specialty: req.body.sendObj.specialty,
				}

	             model.user.findOne(
	                {
	                    user_id: req.user.user_id
	                },
	                {
	                    accepted_doctors : 1,
	                    patient_mail: 1,
	                    firstname:1,
	                    lastname:1,
	                    profile_pic_url:1
	                    
	                }
	            )
	            .exec(
	                function(err, result){                    
	                    for (var i = 0; i < result.patient_mail.length; i++) {
	                    	if(!req.body.sendObj.compaintId){
	                        if (result.patient_mail[i].user_id === DocObj.doctor_id) {
	                            result.accepted_doctors.push(DocObj);
	                            deleteFromPatientNotification(i);
	                            updateDoctorPatientList();
	                            break;
	                        }
	                      } else {	                      	
	                      	if (result.patient_mail[i].complaint_id === req.body.sendObj.compaintId) {
	                            result.accepted_doctors.push(DocObj);
	                            deleteFromPatientNotification(i);
	                            updateDoctorPatientList();
	                            break;
	                        }
	                      }
	                    }

	                    function deleteFromPatientNotification(index) {
	                    	console.log(index)
	                      result.patient_mail.splice(index,1);                                  
	                    }

	                    var msgInfo;

	                    function updateDoctorPatientList() {
	                      model.user.findOne(
	                        {
	                          user_id: req.body.sendObj.user_id
	                        },
	                        {
	                          doctor_patients_list:1,
	                          phone: 1,
	                          firstname:1,
	                          lastname:1,
	                          phone:1,
	                          user_id:1,
	                          presence:1
	                        }
	                      )
	                      .exec(function(err,data){
	                        data.doctor_patients_list.unshift({
	                          patient_firstname: result.firstname,
	                          patient_lastname: result.lastname,
	                          patient_id: req.user.user_id,
	                          patient_profile_pic_url: result.profile_pic_url
	                        });

	                        if(data.presence === true){
					                  io.sockets.to(data.user_id).emit("acceptance notification",{status:true})
					                } else {
					                  var msgBody = "Success! " +  result.firstname + " " + result.lastname + " is now your patient. Visit http://applinic.com/login"
					                  var phoneNunber = "234" + data.phone;
					                  sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

					                  }); //"2348096461927"
					                }

	                        msgInfo = "Transaction successful! Your account is debited. " + data.firstname + " " + data.lastname + " is now your doctor." 
	                        data.save(function(err,info){
	                          if(err) throw err;	                           	                          
	                        });

	                        result.save(function(err,info){
		                        if(err) throw err;                       
		                    		removeFromWaitingRoom();
		                    	});
	                      })

	                    }
	                    //remove from patient waiting list
	                    function removeFromWaitingRoom(){
	                    	model.help.remove({complaint_id:req.body.sendObj.compaintId},function(err,info){
	                    	});
	                    	res.send({message: msgInfo,balance:debitor.ewallet.available_amount});
	                      console.log("note deleted");                        		                   
	                    }

	                }
            	)
							           
        	} 


		} else {
			res.send("You are not registered as a patient or not a patient in this platform");
		}
	});

	//this route takes care of patient billing ie making payments for services and drugs purchased.
	//the cost will be split into percentage.
	// the percentage will be contoled by a percentage setter controlled by the admin.
	router.post("/user/payment/patient-billing",function(req,res){
		if(req.user){
			console.log(req.body);
			model.otpSchema.findOne({otp:req.body.otp},function(err,data){
				if(err) throw err;
				if(!data){
					res.send({message:"Confirmation failed! Transaction canceled."});					
				} else {
					//do the actual transaction
					if(data.user_id === req.body.patientId && data.senderId === req.user.user_id) {					
						model.user.findOne({user_id:req.user.user_id},{ewallet:1,user_id:1,city_grade:1,type:1,email:1}).exec(function(err,center){				
							if(err) throw err;
							var pay = new Wallet(req.body.date,req.body.patient_firstname,req.body.patient_lastname,"billing");
							pay.billing(model,req.body,center,sms,io);
							model.otpSchema.remove({otp:req.body.otp},function(err,info){});							
							res.send({message: "Transaction successful! Your account is credited.",balance:center.ewallet.available_amount});							
						});
						
					} else {
						res.send({message: 'Transaction cancelled! Reason: This OTP is not for the right user.'});						
					}
					
				}				
			})
		} else {
			res.send("Unauthorized access!!!");
		}
	});


  //this route handles test result sent by a laboratory to update existing doctor/patient session that initiated such test request.
  router.put("/user/laboratory/test-result/session-update",function(req,res){
    //note that sms will be sent to patient and doctor when a lab test result is available.
    if(req.user) {
      console.log(req.body)
      //checks otp before test will be updated.
      if(req.body.laboratory.v_pin) {
        model.otpSchema.findOne({otp:req.body.laboratory.v_pin},function(err,data){
          if(err) throw err;

          if(!data) {
            res.send({message: "Error! Wrong OTP or OTP does not exist!"});
          } else {                          
            if(data.user_id === req.body.laboratory.patient_id && data.senderId === req.user.user_id) {         
              updateSession();
            }
          }

        });
      } else {
        res.send({message: "Payment verification failed"})
      }

      function updateSession() {       
        model.user.findOne({"doctor_patient_session.session_id": req.body.laboratory.session_id},{doctor_patient_session:1}).exec(function(err,data){
          if(err) throw err;
          var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.laboratory.session_id);
          var objectFound = data.doctor_patient_session[elementPos];         

          var pos = objectFound.diagnosis.laboratory_test_results.map(function(x) { return x.test_id;}).indexOf(req.body.laboratory.test_id);
          var theObj = objectFound.diagnosis.laboratory_test_results[pos];         
          theObj.receive_date = req.body.laboratory.date;
          theObj.test_to_run = req.body.laboratory.test_to_run;
          theObj.report = req.body.laboratory.report;
          theObj.conclusion = req.body.laboratory.conclusion;
          theObj.sent_date = req.body.date;
          theObj.test_ran_by = req.user.name;
           
          
          //the doctors session for a patient is updated, and patient dashboard is called for update.
          //objectFound.diagnosis.laboratory_test_results.unshift(testResult);          
          data.save(function(err,info){
            if(err) {
              res.send({status: "error"});
            } else {         
              updatePatient();
              updateTheCenter();              
            }
          });        

        });
      }

      function updatePatient() {
        //here patient test result is updated.
        model.user.findOne({user_id: req.body.laboratory.patient_id},{medical_records: 1,patient_notification:1,user_id:1,presence:1,phone:1})
        .exec(function(err,data){
          if(err) throw err;
          var elementPos = data.medical_records.laboratory_test.map(function(x) {return x.ref_id; }).indexOf(req.body.ref_id);
          var objectFound = data.medical_records.laboratory_test[elementPos];           
          objectFound.report = req.body.laboratory.report || objectFound.report;
          objectFound.conclusion = req.body.laboratory.conclusion || objectFound.conclusion;
          objectFound.test_to_run = req.body.laboratory.test_to_run || objectFound.test_to_run;
          objectFound.sent_date = req.body.date || objectFound.sent_date;
          objectFound.test_ran_by = req.user.name;
          objectFound.receive_date = req.body.laboratory.date;
          objectFound.payment_acknowledgement = true;


          var random = Math.floor(Math.random() * 999999);

          data.patient_notification.unshift({
            type:"laboratory",
            date: req.body.laboratory.date,
            note_id: random,
            ref_id: req.body.ref_id,
            session_id:req.body.laboratory.session_id,
            message: "Laboratory test result received."
          })

          if(data.presence === true){
            io.sockets.to(data.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "Your laboratory test result is ready! Visit http://applinic.com/login"
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          data.save(function(err,info){
            if(err) res.send({status: "error"}); 
            //res.send({status: "success"});          
          });
        });
      }

      function updateTheCenter() {
        model.user.findOne({user_id: req.user.user_id},{referral:1,ewallet:1,user_id:1,city_grade:1,type:1,email:1}).exec(function(err,center){
          if(err) throw err;            
          var elementPos = center.referral.map(function(x) {          	
          	return x.ref_id
          }).indexOf(req.body.ref_id);
          
          var objectFound = center.referral[elementPos];
          objectFound.laboratory.attended = true; // this makes a lab that has been sent to a doctor and no longer on the pending list of front end

          var pay = new Wallet(req.body.date,req.body.laboratory.patient_firstname,req.body.laboratory.patient_lastname,"billing");
          pay.billing(model,req.body.payObj,center,sms,io);
          model.otpSchema.remove({otp:req.body.otp},function(err,info){});              
          res.send({message: "Transaction successful! Your account is credited.",balance:center.ewallet.available_amount,status: "success"});
          center.save(function(err,info){})
        });
      }
    } else {
      res.end("Unauthorized access");
    }
  });


	//this route is like above only it only updates the patient lab test on the patient dashboard. this is used for patient on em profile and 
  //patient who requested test without doctors approval.
  router.put("/user/laboratory/test-result/patient-test-update",function(req,res){
    if(req.user) {
     //checks otp before test will be updated.
      if(req.body.laboratory.v_pin) {
        model.otpSchema.findOne({otp:req.body.laboratory.v_pin},function(err,data){
          if(err) throw err;

          if(!data) {
            res.send({message: "Error! Wrong OTP or OTP does not exist!"});
          } else {                          
            if(data.user_id === req.body.laboratory.patient_id && data.senderId === req.user.user_id) {         
              updatePatient();
            }
          }
        });
      } else {
        res.send({message: "Payment verification failed"});
      }

      function updatePatient() {
        model.user.findOne({user_id: req.body.laboratory.patient_id},{medical_records:1,patient_notification:1,user_id:1,presence:1,phone:1})
        .exec(function(err,data){
          if(err) throw err;
         
          var elementPos = data.medical_records.laboratory_test.map(function(x) {return x.ref_id; }).indexOf(req.body.ref_id);
          var objectFound = data.medical_records.laboratory_test[elementPos];
          console.log(objectFound)           
          objectFound.report = req.body.laboratory.report || objectFound.report;
          objectFound.conclusion = req.body.laboratory.conclusion || objectFound.conclusion;
          objectFound.test_to_run = req.body.laboratory.test_ran || objectFound.test_to_run;
          objectFound.sent_date = req.body.date || objectFound.sent_date;
          objectFound.receive_date = req.body.laboratory.date;
          objectFound.payment_acknowledgement = true;
          objectFound.history = req.body.history;


          var random = Math.floor(Math.random() * 9999999999);
          data.patient_notification.unshift({
            type:"laboratory",
            date: req.body.laboratory.date,
            note_id: random,
            ref_id: req.body.ref_id,
            session_id:req.body.session_id,
            message: "Laboratory test result received."
          });

          if(data.presence === true){
            io.sockets.to(data.user_id).emit("notification",{status:true});
          } else {
            var msgBody = "Your laboratory test result is ready! Visit http://applinic.com/login"
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          data.save(function(err,info){
            if(err) res.send({status: "error"});           
            //res.send({status: "success"});
            transact();
          });
        
        });
      }

      function transact() {
        model.user.findOne({user_id:req.user.user_id},{ewallet:1,user_id:1,city_grade:1,type:1,email:1}).exec(function(err,center){
        console.log(req.body)       
          if(err) throw err;
          var pay = new Wallet(req.body.date,req.body.laboratory.patient_firstname,req.body.laboratory.patient_lastname,"billing");
          pay.billing(model,req.body.payObj,center,sms,io);
          model.otpSchema.remove({otp:req.body.otp},function(err,info){});              
          res.send({message: "Transaction successful! Your account is credited.",balance:center.ewallet.available_amount,status: "success"});
          center.save(function(err,info){})             
        });
      }

    } else {
      res.send("Unauthorized access!");
    }

  });



	//updating radiology result in doctor's treatment page with patient.
  router.put("/user/radiology/test-result/session-update",function(req,res){      
    if(req.user) {  	
  
      console.log(req.body);
      //checks otp before test will be updated.
      if(req.body.radiology.v_pin) {
        model.otpSchema.findOne({otp:req.body.radiology.v_pin},function(err,data){
          if(err) throw err;

          if(!data) {
            res.send({message: "Error! Wrong OTP or OTP does not exist!"});
          } else {                          
            if(data.user_id === req.body.radiology.patient_id && data.senderId === req.user.user_id) {         
              updateSession();
            }
          }

        });
      } else {
        res.send({message: "Payment verification failed"});
      }

      function updateSession() { 
        model.user.findOne({"doctor_patient_session.session_id": req.body.radiology.session_id},{doctor_patient_session:1}).exec(function(err,data){
          if(err) throw err;
          var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.radiology.session_id);
          var objectFound = data.doctor_patient_session[elementPos];     

          //the doctors session for a patient is updated, and patient dashboard is called for update.
          var pos = objectFound.diagnosis.radiology_test_results.map(function(x) { return x.test_id;}).indexOf(req.body.radiology.test_id)
          var theObj = objectFound.diagnosis.radiology_test_results[pos];         
          theObj.receive_date = req.body.radiology.date;
          theObj.test_to_run = req.body.radiology.test_to_run;
          theObj.report = req.body.radiology.report;
          theObj.conclusion = req.body.radiology.conclusion;
          theObj.sent_date = req.body.date;
          theObj.test_ran_by = req.user.name;
          theObj.files = req.body.radiology.filesUrl;


          data.save(function(err,info){
            if(err) res.send({status: "error"});         
            updatePatient();
            updateTheCenter();
          });        

        });
			}

      function updatePatient() {         
        //here patient test result is updated.
        model.user.findOne({user_id: req.body.radiology.patient_id},{medical_records: 1,patient_notification:1,user_id:1,presence:1,phone:1})
        .exec(function(err,data){
          if(err) throw err;
          var elementPos = data.medical_records.radiology_test.map(function(x) {return x.session_id; }).indexOf(req.body.radiology.session_id);
          var objectFound = data.medical_records.radiology_test[elementPos];           
          objectFound.report = req.body.radiology.report || objectFound.report;
          objectFound.conclusion = req.body.radiology.conclusion || objectFound.conclusion;
          objectFound.test_to_run = req.body.radiology.test_to_run || objectFound.test_to_run;
          objectFound.sent_date = req.body.date || objectFound.sent_date;
          objectFound.receive_date = req.body.radiology.date;
          objectFound.payment_acknowledgement = true;
          objectFound.files = req.body.radiology.filesUrl;

          //var random = Math.floor(Math.random() * 999999);
          data.patient_notification.unshift({
            type:"radiology",
            date: req.body.radiology.date,
            note_id: req.body.radiology.test_id,
            ref_id: req.body.ref_id,
            session_id:req.body.radiology.session_id,
            message: "Radiology test result received."
          });

          if(data.presence === true){
            io.sockets.to(data.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "Your radiology test result is ready! Visit http://applinic.com/login"
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          data.save(function(err,info){
            if(err) res.send({status: "error"});           
            //res.send({status: "success"});
          });
        });
      }

      function updateTheCenter() {
        model.user.findOne({user_id: req.user.user_id},{referral:1,ewallet:1,user_id:1,city_grade:1,type:1,email:1}).exec(function(err,center){
          if(err) throw err;            
          var elementPos = center.referral.map(function(x) {          	
          	return x.ref_id
          }).indexOf(req.body.ref_id);
          
          var objectFound = center.referral[elementPos];
          objectFound.radiology.attended = true; // this makes a lab that has been sent to a doctor and no longer on the pending list of front end

          var pay = new Wallet(req.body.date,req.body.radiology.patient_firstname,req.body.radiology.patient_lastname,"billing");
          pay.billing(model,req.body.payObj,center,sms,io);
          model.otpSchema.remove({otp:req.body.otp},function(err,info){});              
          res.send({message: "Transaction successful! Your account is credited.",balance:center.ewallet.available_amount,status: "success"});
          center.save(function(err,info){})
        });
      }

    } else {
      res.end("Unauthorized access");
    }

  });
  
    //this route is like above only it only updates the patient scan test on the patient dashboard. this is used for patient on em profile and 
    //patient who requested test without doctors approval.
    router.put("/user/radiology/test-result/patient-scan-update",function(req,res){

	    if(req.user) {
	    	if(req.body.radiology.v_pin) {
	        model.otpSchema.findOne({otp:req.body.radiology.v_pin},function(err,data){
	          if(err) throw err;

	          if(!data) {
	            res.send({message: "Error! Wrong OTP or OTP does not exist!"});
	          } else {                          
	            if(data.user_id === req.body.radiology.patient_id && data.senderId === req.user.user_id) {         
	              updatePatient();
	            }
	          }
	        });
	      } else {
	        res.send({message: "Payment verification failed"});
	      }

	      function updatePatient() {
		      model.user.findOne({user_id: req.body.radiology.patient_id},{medical_records: 1,patient_notification:1,user_id:1,presence:1,phone:1}).exec(function(err,data){
		        if(err) throw err;
		        var elementPos = data.medical_records.radiology_test.map(function(x) {return x.ref_id; }).indexOf(req.body.ref_id);
		        var objectFound = data.medical_records.radiology_test[elementPos];           
		        objectFound.report = req.body.radiology.report || objectFound.report;
		        objectFound.conclusion = req.body.radiology.conclusion || objectFound.conclusion;
		        objectFound.test_to_run = req.body.radiology.test_ran || objectFound.test_to_run;
		        objectFound.sent_date = req.body.date || objectFound.sent_date;
		        objectFound.receive_date = req.body.radiology.date;
		        objectFound.payment_acknowledgement = true;
		        objectFound.files = req.body.radiology.filesUrl;

		        var random = Math.floor(Math.random() * 999999);
		        data.patient_notification.unshift({
		          type:"radiology",
		          date: req.body.radiology.date,
		          note_id: random,
		          ref_id: req.body.ref_id,
		          session_id:req.body.radiology.session_id,
		          message: "Radiology test result received."
		        });

		        if(data.presence === true){
		          io.sockets.to(data.user_id).emit("notification",{status:true})
		        } else {
		          var msgBody = "Your radiology test result is ready! Visit http://applinic.com/login";
		          var phoneNunber = "234" + data.phone;
		          sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

		          }); //"2348096461927"
		        }

		        data.save(function(err,info){
		          if(err) res.send({status: "error"});           
		          transact();
		        });

		      });
				}

				function transact() {
	        model.user.findOne({user_id:req.user.user_id},{ewallet:1,user_id:1,city_grade:1,type:1,email:1}).exec(function(err,center){
	        	console.log(req.body);       
	          if(err) throw err;
	          var pay = new Wallet(req.body.date,req.body.radiology.patient_firstname,req.body.radiology.patient_lastname,"billing");
	          pay.billing(model,req.body.payObj,center,sms,io);
	          model.otpSchema.remove({otp:req.body.otp},function(err,info){});              
	          res.send({message: "Transaction successful! Your account is credited.",balance:center.ewallet.available_amount,status: "success"});
	          center.save(function(err,info){})             
	        });
      	}

			} else {
				res.redirect("/login");
			}

    });


	router.get("/user/:userId/transactions",function(req,res){
		if(req.user){
			model.user.findOne({user_id:req.params.userId},{ewallet:1},function(err,data){
				if(err) throw err;				
				var foundList = data.ewallet.transaction.map(function(x){
					if(x.date >= parseInt(req.query.from) && x.date <= parseInt(req.query.to)) {						
						return x;
					}						
				});				
				var newList = [];
				for(var i = 0; i < foundList.length; i++){
					if(foundList[i] !== undefined){
						newList.push(foundList[i]);
					}
				}
				res.send(newList);
			});
		} else {
			res.send({errMsg:"Unauthorized access!"});
		}
	});

	//user cashing out some money from wallet.
	router.put("/user/cashout",function(req,res){
		if(req.user){
			console.log(req.body)
			var userId = (req.body.userId === undefined) ? req.user.user_id : req.body.userId;
			model.user.findOne({user_id:userId},{ewallet:1}).exec(function(err,wallet){
				if(err) throw err;
				if(wallet.ewallet.available_amount >= req.body.amount) {
					wallet.ewallet.available_amount -= req.body.amount;
					allClear(wallet.ewallet.available_amount);
					wallet.save(function(err,info){
						if(err) throw err;
					});				
				} else {
					res.send({message: "Request rejected!! Reason; amount for cash out is more than available balance."});
				}
			});

			function allClear(wallet) {
				var random = Math.floor(Math.random() * 999999999999999);
				var date = + new Date();
				var CashObj = new model.cashout({
					date: date,
					id: random,
					bank: req.body.bank_name,
					amount: req.body.amount,
					firstname: req.user.firstname,
					lastname: req.user.lastname,
					name: req.user.name,
					user_id: req.user.user_id,
					account_number: req.body.account_number,
					phone: req.user.phone
				});

				io.sockets.to(process.env.ADMIN_ID).emit("cash out",{
					firstname:req.user.firstname,
					lastname:req.user.lastname,
					id: random,
					name: req.user.name,
					user_id: req.user.user_id,
					amount: req.body.amount,
					account_number: req.body.account_number,
					date: date,
					bank: req.body.bank_name,
					phone: req.user.phone
				})

				CashObj.save(function(err,info){
					
				});

				res.send({message: "Request accepted! Transaction may take up to 48hrs to complete.",balance:wallet});
			}

		} else {
			res.send("Unauthorized access!");
		}
	});

	router.get("/user/cashout",function(req,res){
		if(req.user && req.user.user_id === process.env.ADMIN_ID){
			model.cashout.find({},function(err,list){
				if(err) throw err;
				res.send(list)
			})
		} else {
			res.send("Unauthorized access!")
		}
	})

}

module.exports = basicPaymentRoute;




//note to save transaction of previously registered people will error because the model of the date field in the transaction
//object has been changed to "Number" from "string" user for test are naza@gmail.com and cy@gmail.co. this two users don't error during
//saving of transaction because they registered after the field has changed to "number"