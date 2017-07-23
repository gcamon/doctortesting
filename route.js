'use strict';
var path = require('path');
var route = require('./config');
var router = route.router;
var fs = require("fs");
var dateTime = require("node-datetime");
var deleteItem = require("./delete");
var EventEmmiter = require("events");
var emitter = new EventEmmiter();

//var token = require("./twilio");
//var randomUserName = require("./randos");

var basicRoute = function (model,sms,io) {

  router.get("/",function(req,res){
    res.render('index',{"message":""});
  })

  router.get("/user",function (req,res) {
    if(req.user){
     switch(req.user.type){
        case "Doctor":
         res.render("profile",{"person":req.user});
         break;
        case "Patient":
          res.render("patient",{"userInfo": req.user});
          break;
        case "Pharmacy":
          res.render("pharmacy",{"userInfo":req.user});
          break;
        case "Laboratory":
          res.render("laboratory",{"userInfo":req.user});
          break;
        case "Radiology":
          res.render("radiology",{"userInfo":req.user});
          break;              
        default:
         res.render("medical",{"userInfo":req.user});
         break;

         //do for fitness center and physiotherapy
      }
    } else {
     res.render('index',{"message":""});
    }
  });

  router.get("/home",function (req,res) {    
    res.render('index',{"message":""});
  });

  router.get("/user/patient",function(req,res){ 
    if(req.user){
      //getSocketInstance(req)
      res.render("patient",{"userInfo": req.user});
    } else {
      res.redirect('/login');
    }

  });


  router.get("/user/doctor",function(req,res){    
    if(req.user){
      //getSocketInstance(req)     
      res.render("profile",{"person":req.user});
    } else {
      res.redirect("/login");
    }
  });

  router.get("/user/view",function(req,res){
    if(req.user){
      //getSocketInstance(req)
       res.render("medical",{"userInfo": req.user});        
    } else {
      res.redirect('/login');
    }
  });

  router.get("/user/pharmacy",function(req,res){
      if(req.user){
        //getSocketInstance(req)
         res.render("pharmacy",{"userInfo": req.user});        
      } else {
        res.redirect('/login');
      }
  });

  router.get("/user/radiology",function(req,res){
      if(req.user){
        //getSocketInstance(req)
         res.render("radiology",{"userInfo": req.user});        
      } else {
        res.redirect('/login');
      }
  })

  router.get("/user/laboratory",function(req,res){
      if(req.user){
        //getSocketInstance(req)
         res.render("laboratory",{"userInfo": req.user});        
      } else {
        res.redirect('/login');
      }
  })//do for fitness center and physiotherapy


  router.get("/user/doctor/update",function(req,res){
    if(req.user){            
      res.render("profile-update",{"person":req.user});
    } else {
      res.redirect("/login");
    }
  });

  //user requesting login page.
  router.get('/login',function(req,res){
    res.render("success",{"message":""})
  });

  //user request sign up page
  router.get("/signup",function(req,res){
    res.render("sign-up");
  })


  //add default pic
  router.put("/admin/defaul-pic",function(req,res){
    var pic = new model.files(req.body);
    pic.save(function(err,info){
      console.log(info);
      res.send({status:"updated"})
    })
  });

  router.get("/download/profile_pic/:pic_id", function(req,res){        
    if(req.params.pic_id === "nopic") {
      model.files.findOne({file_id:"nopic"},function(err,data){
        if(err) throw err;               
        var nopic = __dirname + "/uploads/" + data.filename;
        res.download(nopic);
      });
    } else {
        var file = __dirname + "/uploads/" + req.params.pic_id;
        res.download(file); // Set disposition and send it.
    }
  });

  router.get('/download/scan-image/:filename',function(req,res){
    var file = __dirname + "/uploads/" + req.params.filename;
    res.download(file); // Set disposition and send it.
  });

  router.get('/download/sick-file/:filename',function(req,res){
    var file = __dirname + "/uploads/" + req.params.filename;
    res.download(file); // Set disposition and send it.
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //handles all change picture 
  router.put("/user/update/profile-pic",function(req,res){
   
    if(req.user){
      if(req.files.length > 0 && req.files[0].mimetype === "image/jpg" || req.files[0].mimetype === "image/jpeg" && req.files[0].size < 2097152) {
          model.user.update({email: req.user.email},{$set : {
          "profile_pic.filename": req.files[0].filename,
          "profile_pic.path":  req.files[0].path,
          "profile_pic.mimetype":  req.files[0].mimetype,
          "profile_pic.encoding":  req.files[0].encoding,
          "profile_pic.size":  req.files[0].size,
          "profile_pic.destination":  req.files[0].destination,
          "profile_pic.fieldname":  req.files[0].fieldname,
          "profile_pic.originalname":  req.files[0].originalname,
          profile_pic_url: "/download/profile_pic/" + req.files[0].filename
          }},function(err,info){        
          if(err) throw err;
          console.log(info) 
          var pic = "/download/profile_pic/"  + req.files[0].filename;      
          res.send({profile_pic_url: pic});               
          });
      } else {
          res.send({error: "Picture does not meet specifications"});
      }
    } else {
      res.end("Unauthorized access!")
    }
  });
  //doctors profile update route
  router.put("/user/update",function(req,res){

    if(req.user){
        switch(req.body.type){
        case "picture":            
            if(req.files.length > 0 && req.files[0].mimetype === "image/jpg" || req.files[0].mimetype === "image/jpeg" && req.files[0].size < 2097152){
                model.user.update({email: req.user.email},{$set : {
                "profile_pic.filename": req.files[0].filename,
                "profile_pic.path":  req.files[0].path,
                "profile_pic.mimetype":  req.files[0].mimetype,
                "profile_pic.encoding":  req.files[0].encoding,
                "profile_pic.size":  req.files[0].size,
                "profile_pic.destination":  req.files[0].destination,
                "profile_pic.fieldname":  req.files[0].fieldname,
                "profile_pic.originalname":  req.files[0].originalname,
                profile_pic_url: "/download/profile_pic/" + req.files[0].filename
                }},function(err,info){        
                if(err) throw err;
                console.log(info) 
                var pic = "/download/profile_pic/"  + req.files[0].filename;      
                res.send(pic);   //repalce with "success" as fallback               
                });
            } else {
                res.send({error: "Picture does not meet specifications"});
            }
            break; 
        case "form":
            model.user.findOne(
                {
                    email: req.user.email
                }
            )
            .exec(
                function(err, result){
                    if(req.body.introductory)
                        result.introductory = req.body.introductory;
                    if(req.body.firstname)
                        result.firstname = req.body.firstname;
                    if(req.body.lastname)
                        result.lastname = req.body.lastname;
                    if(req.body.address)
                        result.address = req.body.address;
                    if(req.body.phone)
                        result.phone = req.body.phone;
                    if(req.body.experience)
                        result.experience = req.body.experience;                         
                    for(var i in req.body){                      
                        if(req.body.hasOwnProperty(i) && Object.prototype.toString.call( req.body[i] ) === '[object Array]'){                            
                           switch(i){
                               case "education":
                               pushAll(req.body.education);                                                               
                               break;
                               case "procedure":
                                pushAll(req.body.procedure);                               
                               break;
                               case "subSpecialty":
                                pushAll(req.body.subSpecialty);                               
                               break;
                               case "award":
                                pushAll(req.body.award);                               
                               break;
                               case "office":
                                pushAll(req.body.office);                               
                               break;
                               default:                               
                               break;
                           }
                        }
                        
                    }
                    function pushAll(arr){                        
                            for(var i = 0; i < arr.length; i++){
                                if(Object.keys(arr[i]).length > 2){
                                switch(arr[i].type){
                                case "edu":
                                result.education.push(arr[i]);
                                break;
                                case "pro":
                                result.procedure.push(arr[i]);
                                break;
                                case "ss":
                                result.sub_specialty.push(arr[i]);
                                break;
                                case "ha":
                                result.awards.push(arr[i]);
                                break;
                                case "of":
                                result.office_hour.push(arr[i]);
                                break;
                                default:
                                break;
                                }
                                }
                            } 
                        
                    }
                    result.save(function(err){
                        if(err) throw err;                       
                        res.send("success");
                    });
                }
            )

            
          break;
          default:
            res.end();
          break;   
        
        }     
    } else {
      res.redirect("/");
    }
  });

  router.get("/user/doctor/schedule",function(req,res){
      if(req.user){
      res.render("profile",{"person":req.user});
      } else {
      res.sendFile(path.join(__dirname + "/404.html"));
      }
  });

  router.get("/assets", function (req,res) {
      res.send('css');
      res.send('js');
      res.send('images');
  });
  // fetch data for patient profile update inner page
  router.get("/user/profile/getDetails",function(req,res){
      if(req.user) {
          res.send({
              profile_pic_url: req.user.profile_pic_url,
              firstname: req.user.firstname,
              lastname: req.user.lastname,
              age: req.user.age,
              gender: req.user.gender,
              address: req.user.address,
              state: req.user.state,
              city: req.user.city,
              marital_status: req.user.marital_status,
          })
      } else {
          res.end("error: Not authorized")
      }
    });
    // put updated data to the database.
    router.put("/user/patient-profile/update", function(req,res){
        if(req.user){
            model.user.update({user_id: req.user.user_id},req.body,function(err,info){
                res.send("updated");
            });
        } else {
            res.end("error: Not authorized")
        }
    })

    //navigates to list views accordingly
    router.get("/topview/:name", function (req,res) {
        switch (req.params.name) {
            case "doctors":
                model.user.find(
                    {type:"Doctor"},{
                        firstname:1,
                        lastname:1,
                        address:1,
                        profile_url:1,
                        profile_pic_url: 1,
                        introductory:1,
                        education:1,
                        sub_specialty:1,
                        specialty:1,
                        procedure:1,
                        work_place:1,
                        phone:1,
                        experience:1,
                        country: 1,
                        city:1,
                        user_id:1
                    },function(err,data){
                    if(err) throw err;
                    console.log(data);
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }                                  
                }).limit(20);                
                break;
            case "hospitals":
                model.user.find({type:"Hospital"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1,education:1},function(err,data){
                    if(err) throw err;                                     
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);               
                break;
            case "clinics":
                model.user.find({type:"Clinic"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1},function(err,data){
                    if(err) throw err;                                     
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);               
                break;
            case "pharmacy":
                model.user.find({type:"Pharmacy"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1},function(err,data){
                    if(err) throw err;                                     
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);               
                break;
            case "laboratories":
                model.user.find({type:"Laboratory"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1},function(err,data){
                    if(err) throw err;                                    
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);             
                break;
            case "radiology":
                model.user.find({type:"Radiology"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1},function(err,data){
                    if(err) throw err;                                   
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);             
                break;
            case "fitness":
                model.user.find({type:"Fitness"},{firstname:1,lastname:1,address:1,profile_url:1,profile_pic_url: 1},function(err,data){
                    if(err) throw err;                                
                    if(data) {
                        res.render("list-view",{"userInfo":data});
                    }             
                }).limit(10);             
                break;
            default:
                res.sendFile(path.join(__dirname + "/404.html"));            
        }
    });

    router.get("/users/cities",function(req,res){
         model.user.find(
            {},{
                city:1,
                type:1
            },function(err,data){
            if(err) throw err;
            if(data) {
                var allUsers = {};
                var allCity = {}; 
                allUsers.cities = [];  
                allUsers.total_doctors = 0;
                allUsers.total_hospitals = 0;
                allUsers.total_clinics = 0;
                allUsers.total_pharmarcy = 0;
                allUsers.total_radiology = 0;
                allUsers.total_laboratory = 0;
                allUsers.total_fitness = 0;
                for(var i = 0; i < data.length; i++){
                    if(!allCity.hasOwnProperty(data[i].city)){
                        allCity[data[i].city] = data[i].city;
                        allUsers.cities.push(data[i].city);
                    }                                                     
                    switch(data[i].type){
                        case "Doctor":
                           allUsers.total_doctors++;
                        break;
                        case "Hospital":
                           allUsers.total_hospitals++;
                        break;
                        case "Clinic":
                           allUsers.total_clinics++;
                        break;
                        case "Pharmacy":
                           allUsers.total_pharmacy++;
                        break;
                        case "Laboratory":
                           allUsers.total_radiology++;
                        break;
                        case "Radiology":
                           allUsers.total_laboratory++;
                        break;
                        case "Fitness":
                           allUsers.total_fitness++;
                        break;
                        default:
                        break;
                    }
                }
                
                res.send(allUsers);
            }                                  
            }).limit(1000);                
    });

    router.get("/ranking/views/:id",function(req,res){
        model.user.findOne({user_id: req.params.id},function(err,user){            
            if(err) throw err;
            res.render("doctor-details",{"userInfo":user});
        });
    });

    
    router.get("/user/patient/find-doctor",function(req,res){
      if(req.user){
        console.log(req.query)
        var criteria;
        var str;
        if(req.query.city && !req.query.specialty){
          str = new RegExp(req.query.city);          
          criteria = { city : { $regex: str, $options: 'i' }};
        } else if(req.query.city && req.query.specialty){
          str = new RegExp(req.query.city);
          criteria = { city : { $regex: str, $options: 'i' },specialty: req.query.specialty}
        } else {
          criteria = req.query;
        }
        model.user.find(criteria,{
          name:1,
          _id:0,
          profile_pic_url: 1,
          specialty:1,
          profile_url:1,
          firstname:1,
          lastname:1,
          country: 1,
          city:1,
          user_id:1,
          address:1,
          phone:1,
          work_place:1
        },function(err,data){
          if(err) throw err;
          res.send(data);
          
        });
      } else {
        res.send("Unauthorized access!")
      }
    })

    router.get("/user/find-specialist",function(req,res){
        res.render("list-doctors",{"userInfo":req.user})
    });

    //common search for doctors route
    router.post("/user/find-group",function(req,res){
     if(Object.keys(req.body).length > 0) {
      console.log(req.body);
        model.user.find(
        req.body,{
            firstname:1,
            lastname:1,
            address:1,
            profile_url:1,
            profile_pic_url: 1,
            introductory:1,
            education:1,
            sub_specialty:1,
            specialty:1,
            procedure:1,
            work_place:1,
            phone:1,
            experience:1,
            country: 1,
            city:1,
            user_id:1                
        },function(err,data){
        if(err) throw err;
            res.send(data)               
        }).limit(1000);
     } else {
         res.end();
     }                
    });

    //refine search route for search for doctors
    router.post("/user/refine-find-group",function(req,res){
     if(Object.keys(req.body).length > 0) {
      console.log(req.body);
      var projection = {
            firstname:1,
            lastname:1,
            address:1,
            profile_url:1,
            profile_pic_url: 1,
            introductory:1,
            education:1,
            sub_specialty:1,
            specialty:1,
            procedure:1,
            work_place:1,
            phone:1,
            experience:1,
            country: 1,
            city:1                
        }
        if(req.body.procedure){
            model.user.find(
            {
                city: req.body.city,
                specialty: req.body.specialty,
                "sub_specialty.sub_specialty": req.body.sub_specialty,
                "procedure.procedure_description": req.body.procedure
            },projection,function(err,data){
            if(err) throw err;
                res.send(data)               
            }).limit(1000);
        } else {
             model.user.find(
            {
                city: req.body.city,
                specialty: req.body.specialty,
                "sub_specialty.sub_specialty": req.body.sub_specialty,
            },projection,function(err,data){
                console.log()
            if(err) throw err;
                res.send(data)               
            }).limit(1000);
            }
     } else {
         res.end();
     }                
    });
    
    //route for displaying the selected doctor on the patient dashbord page
    router.put("/user/book",function(req,res){
        if(req.user){
            model.user.findOne(req.body,{
              firstname:1,
              lastname:1,
              profile_url:1,
              profile_pic_url:1,
              specialty:1,
              office_hour:1,
              address:1,
              work_place:1,
              experience:1,
              education:1},function(err,data){
                res.send(data);
            })
        } else {
            res.json({isNotLoggedIn: true, error: "We notice you are NOT logged in!", beNice: "Please Login or Register to make use of these services"})
        }
    });

    //route for qusetions and requsts from patients to a doctor through the modal
    router.put("/user/patient/doctor/connection",function(req,res){
      if(req.user){           
        req.body.sender_firstname = req.user.firstname;
        req.body.sender_lastname = req.user.lastname;
        req.body.sender_profile_pic_url = req.user.profile_pic_url;
        req.body.sender_id = req.user.user_id;
        var requestData = {};
        for(var item in req.body){
          if(req.body.hasOwnProperty(item) && item !== "receiverId") {
              requestData[item] = req.body[item];
          }
        }
        
        model.user.findOne({user_id:req.body.receiverId},{doctor_notification:1,presence:1,set_presence:1,phone:1}).exec(function(err,data){
          if(err) throw err;
          data.doctor_notification.push(requestData);
          if(data.presence === true && data.set_presence.general === true){
            console.log("did it happen bro !!!!");
            io.sockets.to(req.body.receiverId).emit("receive consultation request",{status: "success"})
          } else if(data.set_presence.general === false) {

          } else {
            var msgBody = req.user.title + " " + req.user.firstname + " " + req.user.lastname + " sends consultation request! Visit http://applinic.com/login";
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){})
          }
          data.save(function(err,info){});
          res.send({status:"notified"});
        });
      
      } else {
        res.redirect("/login");
      }
        
    });

    //this route gets all the notifications for the doctor that just logged in
    router.get("/user/doctor/notifications",function(req,res){
        if(req.user){
         model.user.findOne({user_id:req.user.user_id},{doctor_notification:1,_id:0},function(err,data){                
            res.send(data);
         })
        } else {
          res.redirect("/login");
        }
    });

    router.get("/user/doctor/get-patient-prescription-request",function(req,res){        
      if(req.user){
       model.user.findOne({user_id:req.user.user_id},{doctor_prescriptionRequest:1,_id:0},function(err,data){                
        res.send(data);
       });
      } else {
        res.send("not allowed");
      }
    });

    router.put("/user/doctor/acceptance",function(req,res){
         if(req.user){ 
                  
             model.user.findOne(
                {
                    user_id: req.body.patientId
                },
                {
                    ewallet:1,
                    patient_mail: 1,
                    service_access: 1,
                    user_id:1,
                    phone:1,
                    presence:1
                }
            )
            .exec(
                function(err, result){                    
                    /*if(result.ewallet.available_amount > 0 && result.ewallet.available_amount >= req.body.consultation_fee) {
                        req.body.service_access = true;
                        result.ewallet.available_amount -= req.body.consultation_fee;
                    }*/
                    req.body.service_access = true;
                    var random = Math.floor(Math.random() * 999999999); // use for check on the front end to distinguish messages sent.
                      result.patient_mail.push({
                      message_id: random,
                      user_id: req.user.user_id,
                      firstname: req.user.firstname,
                      lastname: req.user.lastname,
                      title: req.user.title,
                      message: "Consultation request accepted",
                      date: req.body.date,
                      consultation_fee: req.body.consultation_fee,
                      service_access: req.body.service_access,
                      profile_pic_url: req.user.profile_pic_url,
                      specialty: req.user.specialty
                    });

                    if(result.presence === true){
                      io.sockets.to(result.user_id).emit("message notification",{status:true})
                    } else {
                      var msgBody = req.user.title + " " + req.user.firstname + " " + req.user.lastname + " accepted your consultation request! Visit http://applinic.com/login";
                      var phoneNunber = "234" + result.phone;
                      sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

                      }); //"2348096461927"
                    }

                    result.save(function(err){
                      if(err) throw err;
                      console.log("updated");                        
                      res.send({status: "success"});
                    });

                }
            )
            
        } else {
           res.send("not allowed");
        }
    });

    router.put("/user/admin/patient-mail",function(req,res){

    });

    router.put("/user/doctor/decline-mail",function(req,res){

    })

    router.put("/user/doctor/redirect-mail",function(req,res){
      
    })
    

    //this router gets all the patient medical records and prescriptions and send it to the front end as soon as the patient logs in. 
    //the data is sent as json and the controller that receives it on the front end is "patientPanelController" .
    router.get("/user/get-medical-record",function(req,res){
      
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

    //center notification route    
    router.get("/user/center/get-notification",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{diagnostic_center_notification:1,_id:0},function(err,data){
          if(err) throw err;
          res.send(data);
        });
      } else {
        res.redirect("/login");
      }

    });

    //this route gets the individual prescription for a patient 
    router.get("/user/pharmacy/get-referral/:refId",function(req,res){
      if(req.user){
        var toNum = parseInt(req.params.refId)
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;          
          var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(toNum);
          var found = data.referral[elemPos]
          res.send(found);
          console.log(found)
        });
      } else {
        res.redirect("/login")
      }
    })
    //this route gets all referral for a pharmacy.
    router.put("/user/pharmacy/get-referral",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;
          if(data) {
            var list = [];
            var filter = {};
            var toStr;
            for(var i = 0; i < req.body.length; i++){
              toStr = req.body[i].ref_id.toString();
              if(!filter.hasOwnProperty(toStr)){
                var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(req.body[i].ref_id);
                var found = data.referral[elemPos];
                list.push(found);
                filter[toStr] = "";
              }
            }

            res.send({prescriptions:list});
          } else {
            res.send({});
          }
        });        
      } else {
        res.end("Unauthorized access!! Please log in")
      }
    });


    //this route takes care of pharmacy billing patients for purchased drugs
    router.post("/user/patient-billing/:patientId",function(req,res){

      var time = + new Date();
      var otp = new model.otpSchema({
        user_id: req.body.user_id,
        time: time,
        otp: req.body.otp,
        amount: req.body.amount
      });
      

      //sets the expiration time for each otp sent.
      var date = new Date();
      otp.expirationDate = new Date(date.getTime() + 120000);
      otp.expirationDate.expires = 300;
      console.log(otp);

      otp.save(function(err,info){
        if(err) throw err;
        console.log("otp saved");
        res.send({success:""});
      });        
      
    });

    //this route gets a notifications for the fn getAllNotification for pharmacy on the client.
    
    //11/4/2016
    router.get("/user/doctor/specific-patient",function(req,res){
      if(req.user){
        var projection = {
            firstname: 1,
            lastname: 1,
            profile_pic_url: 1,       
            address: 1,
            city: 1,
            country: 1,
            age: 1,
            gender: 1,
            body_weight: 1,
            medical_records: 1,
            user_id: 1,
            type: 1,
            presence:1

        }
        model.user.findOne({ user_id: req.query.id},projection,function(err,data){
            if(err) throw err;
            res.send(data);
        });

      } else {
        res.end("Not allowed");
      }
    });

    router.get("/user/doctor/get-patient/medication",function(req,res){
      if(req.user) {        
        model.user.findOne({user_id: req.query.id},{medications:1},function(err,prescriptions){
          if(err) throw err;
          prescriptions.user = req.user.user_id;
          res.json({medications:prescriptions.medications,user: req.user.user_id});
        });
      } else {
        res.end("Unauthorized access!!!")
      }
    });

    router.put("/user/doctor/get-patient/medical-record",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.body.id},{medical_records:1},function(err,records){
          res.send(records);
        });
      } else {
        res.end("Unauthorized access!! Please Log in ");
      }
    });

    
    
   

  // this route runs when the patients wants to view his prescription track record. ie patient wants to see 
    //where all his prescriptions has been send sent to.
    router.get("/user/patient/get-prescription/track-record",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{prescription_tracking:1,_id:0},function(err,data){
          console.log(data.prescription_tracking);
          res.send(data.prescription_tracking);
        })
      } else {
        res.end("Unauthorized access");
      }
    });

    router.put("/user/patient/specific-doctor",function(req,res){
        //finds specific doctor and sends to the client.
        if(req.user){
          var projection = {
              firstname: 1,
              lastname: 1,
              profile_pic_url: 1,
              office_hour: 1,
              profile_url: 1,
              specialty: 1,
              date: 1,
              address: 1,
              work_place: 1,
              user_id:1,
              _id:0,
              presence:1
          }
          model.user.findOne({ user_id: req.body.id},projection,function(err,data){
              if(err) throw err;
              res.send(data);
          })
        }
    });

    //patient searching for a pharmacy to forward his prescription route handlers.
    router.get("/user/patient/getAllPharmacy",function(req,res){
        //gets all pharmacy in the database based on patient's location.
        if(req.user){
          var projection = {
              name: 1,
              address: 1,
              city: 1,
              country: 1,
              rating: 1,
              profile_pic_url: 1,
              user_id: 1,
              type:1
          }
          model.user.find({type:"Pharmacy",city:'Enugu'},projection,function(err,data){ //remenber to replace "Enugu" with req.user.city
              if(err) throw err;
              res.send(data);
          });
        } else {
          res.end("Unauthorized access!")
        }
    });

    router.put("/user/patient/pharmacy/refined-search",function(req,res){
        //coming from thesame controller as above. finds the pharmacy based on the patient search criteria in the req.body.
        console.log(req.body)
        var projection = {
            name: 1,
            address: 1,
            city: 1,
            country: 1,
            rating: 1,
            profile_pic_url: 1,
            user_id: 1,
            type: 1
        }
        model.user.find(req.body,projection,function(err,data){
            if(err) throw err;
            res.send(data);
        })
    });

    router.put("/user/patient/pharmacy/referral-by-patient",function(req,res){
      //this route handle patients sending his prescription to a pharmacy by himself.Therefore the prescription obj already exist. justs to
      //add the prescription object to the chosen pharmacy.
      if(req.user){
        
        model.user.findOne(
          {
            user_id: req.body.user_id
          },
          {
            referral: 1,
            diagnostic_center_notification:1,
            city:1,
            name:1,
            country:1,
            presence:1

          }).exec(function(err,pharmacy){
            var date = new Date();
            var ref_id;
            if(req.body.ref_id) {
              ref_id = req.body.ref_id;
            } else {
              ref_id = Math.floor(Math.random() * 9999999);
            }
            var title = (req.user.type === "Doctor") ? 'Dr.': "";            
            var refObj = {
              ref_id: ref_id,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: title,
              referral_id: req.body.id,    
              date: date,
              pharmacy: req.body
            }
            var pharmacyNotification = {
              sender_firstname: req.user.firstname,
              sender_lastname: req.user.lastname,
              sender_title : title,
              sent_date: date,
              ref_id: ref_id,
              note_id: ref_id,
              sender_profile_pic_url: req.user.profile_pic_url,
              message: 'Hi, I need your services'
            }

            var track_record = {
                date: date,
                center_name: pharmacy.name,
                address: pharmacy.address,
                ref_id: ref_id,
                city: pharmacy.city,
                country: pharmacy.country,
                prescriptionId: req.body.prescriptionId
            };

            model.user.findOne({user_id: req.user.user_id},{prescription_tracking:1}).exec(function(err,patient){
              patient.prescription_tracking.unshift(track_record);
              patient.save(function(err,info){
                if(err) throw err;
              });
            });

            pharmacy.referral.push(refObj);
            pharmacy.diagnostic_center_notification.push(pharmacyNotification);

            if(pharmacy.presence === true){
              io.sockets.to(req.body.user_id).emit("center notification",pharmacyNotification);
            }

            pharmacy.save(function(err,info){
              if(err) throw err;              
            });

           res.send({success:true,ref_id: ref_id}); 
          });

      } else {
        res.end("Unauthorized access. You need to log in")
      }

    });

    router.put("/user/patient/pharmacy/referral-by-pharmacy",function(req,res){
      //this route takes runs when a pharmacy wish to forward unavailable drugs in the center to another pharmacy.
      if(req.user){
        model.user.findOne(
          {
            user_id: req.body.user_id
          },
          {
            referral: 1,
            diagnostic_center_notification:1,
            name:1,
            city:1,
            address:1,
            country: 1

          }).exec(function(err,pharmacy){
            var date = new Date();
            var note_id = Math.floor(Math.random() * 9999999);
            var title = (req.user.type === "Doctor") ? 'Dr.': req.user.name;            
            var refObj = {
              ref_id: req.body.ref_id,              
              referral_title: title,
              referral_id: req.user.user_id,    
              date: date,
              pharmacy: req.body.pharmacy 
            }
            var pharmacyNotification = {              
              sender_firstname : title,
              sent_date: date,
              ref_id: req.body.ref_id,
              note_id: note_id,
              sender_profile_pic_url: req.user.profile_pic_url,
              message: 'Hi, please we dont have the following drugs,maybe you can help.'
            }

            var track_record = {
                date: date,
                center_name: pharmacy.name,
                address: pharmacy.address,
                city: pharmacy.city,
                country: pharmacy.country,
                ref_id: req.body.ref_id,
                prescriptionId: req.body.pharmacy.prescriptionId
            };

            model.user.findOne({user_id:req.body.pharmacy.patient_id},{prescription_tracking:1}).exec(function(err,patient){
              if(err) throw err;
              patient.prescription_tracking.unshift(track_record);
              patient.save(function(err,info){
                if(err) throw err;
              })
            })

            pharmacy.referral.push(refObj);
            pharmacy.diagnostic_center_notification.push(pharmacyNotification);
            pharmacy.save(function(err,info){
              if(err) throw err;
              console.log(info);
            });

           res.send({success:true,ref_id: req.body.ref_id}); 
          });

      } else {
        res.end("Unauthorized access. You need to log in")
      }
    });

    router.put("/user/patient/pharmacy/referral",function(req,res){
      //if prescription is forwarded by a doctor to a pharmacy it talks different form. ie doctor can send prescription
      //straight to a pharmacy. later the patient will be notified. 
      //this block represents doctor action by forwarding prescription to a pharmacy.
      //any data sent to a diagnostic center other than to the patient himself is seens a a referral by this application.
       
      if(req.user){        
         model.user.findOne(
          {
            user_id: req.body.user_id
          },
          {
            referral: 1,
            name:1,
            address:1,
            diagnostic_center_notification:1,
            city:1,
            country:1,
            presence:1

          }).exec(function(err,pharmacy){           
            if(err) throw err;            
            var date = + new Date();
            var ref_id;
            if(req.body.ref_id) {
              ref_id = req.body.ref_id;
            } else {
              ref_id = Math.floor(Math.random() * 9999999);
            }
            

            var preObj = {              
              provisional_diagnosis: req.body.provisional_diagnosis,
              date: date,
              prescriptionId: req.body.prescriptionId,
              doctor_firstname: req.user.firstname,
              doctor_lastname: req.user.lastname,
              doctor_address: req.user.address,
              doctor_verified: req.user.verified,   
              doctor_id: req.user.user_id,
              doctor_work_place: req.user.work_place,
              doctor_city: req.user.city,
              doctor_country: req.user.country,
              lab_analysis: req.body.lab_analysis,
              scan_analysis: req.body.scan_analysis,
              Doctor_profile_pic_url: req.user.profile_pic_url,
              patient_id : req.body.patient_id,
              patient_profile_pic_url: req.body.patient_profile_pic_url,
              patient_firstname: req.body.firstname,
              patient_lastname: req.body.lastname,
              patient_address: req.body.address,
              patient_gender: req.body.gender,
              patient_age: req.body.age,
              patient_city: req.body.city,
              patient_country: req.body.country,
              prescription_body: req.body.prescriptionBody,
              ref_id: ref_id,
              eligible: true
            }

            var title = (req.user.type === "Doctor") ? 'Dr.': ""; 
            var verifyId;
            

            var refObj = {
              ref_id: ref_id,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: title,
              referral_id: req.body.id,    
              date: date,
              pharmacy: preObj
            }

            var pharmacyNotification = {
              sender_firstname: req.user.firstname,
              sender_lastname: req.user.lastname,
              sender_title : title,
              sent_date: date,
              ref_id: ref_id,
              note_id: ref_id,
              sender_profile_pic_url: req.user.profile_pic_url,
              message: 'Please kindly administer the following prescriptions to my patient.'
            }

            pharmacy.referral.push(refObj);
            pharmacy.diagnostic_center_notification.push(pharmacyNotification);

            if(pharmacy.presence === true){
              io.sockets.to(req.body.user_id).emit("center notification",pharmacyNotification);
            }

            model.user.findOne(
              {user_id: req.body.patient_id},{patient_notification:1,firstname:1,lastname:1,prescription_tracking:1,medications:1}
              ).exec(function(err,data){
              if(err) throw err;             
              
              data.patient_notification.unshift({
                type:"pharmacy",
                date: date,
                note_id: req.body.prescriptionId,
                ref_id: ref_id,
                session_id:req.body.session_id,
                message: "You have new unread prescription"
              })

            
              var track_record = {
                date: date,
                center_name: pharmacy.name,
                address: pharmacy.address,
                ref_id: ref_id,
                city: pharmacy.city,
                country: pharmacy.country,
                prescriptionId: req.body.prescriptionId
              };

              data.medications.push(preObj);
              data.prescription_tracking.unshift(track_record);

              data.save(function(err,info){
                if(err) throw err;
                console.log("patient notified");            
              });
            });

            pharmacy.save(function(err,info){             
              if(err) throw err;             
              console.log("prescription saved");                           
            });

            res.json({success:true,ref_id: ref_id,name:pharmacy.name,address:pharmacy.address,city:pharmacy.city,country:pharmacy.country}); 
        });        
     
      } else {
        res.end("Unauthorized Access");
      }   
    });
  
    //user getting the available on the dashboard balance route.
    router.get('/user/:userId/get-balance',function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.params.userId},{ewallet:1},function(err,wallet){
          if(err) throw err;
          res.send({balance: wallet.ewallet.available_amount})
        })
      } else {
        res.send("Unauthorized access!!!")
      }
    });

    router.delete("/user/doctor/delete-prescriptionReq-test",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.user.user_id},{doctor_prescriptionRequest:1}).exec(function(err,data){
          if(err) throw err;
          var elementPos = data.doctor_prescriptionRequest.map(function(x){return x.ref_id}).indexOf(req.body.ref_id)
          var objFound = data.doctor_prescriptionRequest.splice(elementPos,1);          
          
          data.save(function(err,info){
            if(err) throw err;            
          })
          res.send("deleted");
        });

      } else {
        res.end("Unauthorized access!")
      }
      
    })    

    //prescription foewarded by the doctor to a patient inbox
    router.put("/user/patient/forwarded-prescription",function(req,res){   
      if(req.user){  
      console.log(req.body)       
        model.user.findOne(
          {
            user_id: req.body.id
          },           
          {
            medications: 1,          
          }).exec(function(err,result){            
            if(err) throw err;            
            var date = + new Date(); 
            console.log(date)               
            var preObj = {              
              provisional_diagnosis: req.body.provisional_diagnosis,
              date: date,
              prescriptionId: req.body.prescriptionId,
              doctor_firstname: req.user.firstname,
              doctor_lastname: req.user.lastname,
              doctor_address: req.user.address,   
              doctor_id: req.user.user_id,
              doctor_work_place: req.user.work_place,
              doctor_city: req.user.city,
              doctor_country: req.user.country,
              lab_analysis: req.body.lab_analysis,
              scan_analysis: req.body.scan_analysis,
              Doctor_profile_pic_url: req.user.profile_pic_url,
              patient_id: req.body.patient_id,
              patient_profile_pic_url: req.body.patient_profile_pic_url,
              patient_firstname: req.body.firstname,
              patient_lastname: req.body.lastname,
              patient_address: req.body.address,
              patient_gender: req.body.gender,
              patient_age: req.body.age,
              patient_city: req.body.city,
              patient_country: req.body.country,
              prescription_body: req.body.prescriptionBody,
            }           
            result.medications.unshift(preObj);
            result.save(function(err,info){             
              if(err) throw err;                       
            });
        });

        model.user.findOne({user_id: req.body.id},{patient_notification:1,firstname:1,lastname:1,presence:1,user_id:1,phone:1}).exec(function(err,data){
          if(err) throw err;
           

          var date = + new Date();

             
          data.patient_notification.unshift({
            type:"pharmacy",
            date: date,
            note_id: req.body.prescriptionId,
            ref_id: req.body.ref_id,
            session_id:req.body.session_id,
            message: "You have new unread prescription"
          });

          if(data.presence === true){
              io.sockets.to(data.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "You have new unread prescription! Visit http://applinic.com/login"
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){
              
            }); //"2348096461927"
          }


          data.save(function(err,info){
            if(err) throw err;            
            res.send(
              {
                message: "success! prescription forwarded to " + data.firstname + " " + data.lastname,
                firstname: data.firstname,
                lastname: data.lastname,
                ref_id: req.body.ref_id
              }
            );                 
          });
        });
                     
      }
    });

    
    //this route the patient forward his test result to his doctor for prescription.
    router.put("/user/patient/test-result/forward",function(req,res){
      if(req.user) {
        model.user.findOne({user_id: req.body.doctorId},{doctor_prescriptionRequest:1,presence:1,set_presence:1,phone:1}).exec(function(err,data){
          if(err) throw err;
          req.body.sender_firstname = req.user.firstname;
          req.body.sender_lastname = req.user.lastname;
          req.body.sender_profile_pic_url = req.user.profile_pic_url;
          req.body.sender_id = req.user.user_id;
          req.body.status = "new";
          data.doctor_prescriptionRequest.push(req.body);
          if(data.presence === true && data.set_presence.general === true){
            io.sockets.to(req.body.doctorId).emit("receive prescription request",{status: "success"})
          } else if(data.set_presence.general === false) {

          } else {
            var msgBody = "You have new  prescription request from " + req.user.firstname + " " + req.user.lastname + " Visit http://applinic.com/login"
            var phoneNunber = "234" + data.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){
              
            }); //"2348096461927"
          }

          data.save(function(err,info){
            if(err) throw err;
          });

          res.json({status: "success",doctor_id:req.body.doctorId})
        });
      } else {
        res.end("Unauthorized access!!!");
      }
    });

    //this route gets the lists of all prescription request from the doctor's patients
    router.get("/user/doctor/get-patient-request",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.user.user_id},{doctor_prescriptionRequest:1,_id:0},function(err,data){
          res.send(data.doctor_prescriptionRequest);
        });
      } else {
        res.end("Unauthorized access!!!")
      }
    });

    //this route deletes already attended prescription request from doctor_prescriptionRequest list and save to the database.
    router.delete("/user/doctor/delete-request",function(req,res){

    });
    
    //this router takes call of pahrmacy search for a patient prescription from the data base;
    router.put("/user/pharmacy/find-patient/prescription",function(req,res){
       if(req.user){     
        model.user.findOne({user_id:req.user.user_id},{referral:1},function(err,data){
            if (err) throw err;           
              switch(req.body.criteria) {
                case "refIdCriteria":
                  var toNum = parseInt(req.body.ref_id);                
                  var elementPos = data.referral.map(function(x) {return x.ref_id; }).indexOf(toNum);
                  var objectFound = data.referral[elementPos];
                  console.log(objectFound)
                  if(objectFound === undefined) {
                   res.send({error: "Patient prescription not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                case "phoneCriteria":
                  var elementPos = data.referral.map(function(x) {return x.phone; }).indexOf(req.body.phone);
                  var objectFound = data.referral[elementPos];
                  if(objectFound === undefined) {
                   res.send({error: "Patient prescription not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                default:
                  res.send({error: "Please enter search creteria"});
                  break
              }            
        });
      } else {
        res.end("Unauthorized access");
      }
    });

    router.put("/user/laboratory/find-patient/lab-test",function(req,res){
      if(req.user){     
        model.user.findOne({user_id:req.user.user_id},{referral:1},function(err,data){
            if (err) throw err;           
              switch(req.body.criteria) {
                case "refIdCriteria":
                  var toNum = parseInt(req.body.ref_id);                
                  var elementPos = data.referral.map(function(x) {return x.ref_id; }).indexOf(toNum);
                  var objectFound = data.referral[elementPos];
                  console.log(objectFound)
                  if(objectFound === undefined) {
                   res.send({error: "Patient lab test not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                case "phoneCriteria":
                  var elementPos = data.referral.map(function(x) {return x.phone; }).indexOf(req.body.phone);
                  var objectFound = data.referral[elementPos];
                  if(objectFound === undefined) {
                   res.send({error: "Patient lab test not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                default:
                  res.send({error: "Please enter search creteria"});
                  break;
              } 
        });
      } else {
        res.end("Unauthorized access");
      }
    });


    /*
     //this route gets the individual prescription for a patient 
    router.get("/user/pharmacy/get-referral/:refId",function(req,res){
      if(req.user){
        var toNum = parseInt(req.params.refId)
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;          
          var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(toNum);
          var found = data.referral[elemPos]
          res.send(found);
          console.log(found)
        });
      } else {
        res.redirect("/login")
      }
    })
    //this route gets all referral for a pharmacy.
    router.put("/user/pharmacy/get-referral",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;
          if(data) {
            var list = [];
            var filter = {};
            var toStr;
            for(var i = 0; i < req.body.length; i++){
              toStr = req.body[i].ref_id.toString();
              if(!filter.hasOwnProperty(toStr)){
                var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(req.body[i].ref_id);
                var found = data.referral[elemPos];
                list.push(found);
                filter[toStr] = "";
              }
            }

            res.send({prescriptions:list});
          } else {
            res.send({});
          }
        });        
      } else {
        res.end("Unauthorized access!! Please log in")
      }
    });

    */

    router.get("/user/laboratory/get-referral/:refId",function(req,res){
      if(req.user){
        var toNum = parseInt(req.params.refId)
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;          
          var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(toNum);
          var found = data.referral[elemPos]
          res.send(found);
          console.log(found)
        });
      } else {
        res.redirect("/login")
      }
      /*if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          res.send(data.referral);
        })
      } else {
        res.end("Unauthorized access")
      }*/

    })


    //this route gets all referral for a laboratory.
    router.put("/user/laboratory/get-referral",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;
          if(data) {
            var list = [];
            var filter = {};
            var toStr;
            for(var i = 0; i < req.body.length; i++){
              toStr = req.body[i].ref_id.toString();
              if(!filter.hasOwnProperty(toStr)){
                var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(req.body[i].ref_id);
                var found = data.referral[elemPos];
                list.push(found);
                filter[toStr] = "";
              }
            }
            res.send({labTest:list});
          } else {
            res.send({});
          }
        });        
      } else {
        res.redirect("/login")
      }
    });


    router.get("/user/radiology/get-referral/:refId", function(req,res){
      if(req.user){
        var toNum = parseInt(req.params.refId)
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;          
          var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(toNum);
          var found = data.referral[elemPos]
          res.send(found);
          console.log(found)
        });
      } else {
        res.redirect("/login")
      }
      /*if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          res.send(data.referral);
        })
      } else {
        res.end("Unauthorized access")
      }*/
    });

    //this route gets all referral for a laboratory.
    router.put("/user/radiology/get-referral",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},{referral:1,_id:0},function(err,data){
          if(err) throw err;
          if(data) {
            var list = [];
            var filter = {};
            var toStr;
            for(var i = 0; i < req.body.length; i++){
              toStr = req.body[i].ref_id.toString();
              if(!filter.hasOwnProperty(toStr)){
                var elemPos = data.referral.map(function(x){return x.ref_id}).indexOf(req.body[i].ref_id);
                var found = data.referral[elemPos];
                list.push(found);
                filter[toStr] = "";
              }
            }
            res.send({radioTest:list});
          } else {
            res.send({});
          }
        });        
      } else {
        res.redirect("/login");
      }
    });

    router.put("/user/radiology/upload-scan",function(req,res){
      if(req.user){        
        console.log(req.files)
        console.log(req.body)
        var fileUrl = [];
        for(var i = 0; i < req.files.length; i++) {
          var url = "/download/scan-image/" + req.files[i].filename;
          fileUrl.push(url)
        }
        res.send(fileUrl)
      } else {
        res.end('Unauthorized access!!!')
      }
    })
    
    //route for funding wallet
    router.patch("/user/fundwallet",function(req,res){
      model.user.updateOne({ email: req.user.email},function(err,result){
        if(err) throw err;
        console.log("wallet funded");
        console.log(result);
        res.end();
      });
    });

    
    router.get("/user/doctor/call",function(req,res){
      if(req.user){
        res.render("video-chat",{"person":req.user});
      } else {
        res.end("Unauthorized access!")
      }

    });

    router.get("/user/doctor/audio/call",function(req,res){
      if(req.user){
        res.render("audio-chat",{"person":req.user})
      } else {
        res.end("Unauthorized access!")
      }

    });


    router.get("/user/patient/call",function(req,res){
      if(req.user){
        res.render("video-chat2",{"person":req.user})
      } else {
        res.end("Unauthorized access!")
      }

    });

    router.get("/user/patient/audio/call",function(req,res){
      if(req.user){
        res.render("audio-chat2",{"person":req.user})
      } else {
        res.end("Unauthorized access!")
      }

    });


   

    //doctor creates session with a patient
    router.post("/user/doctor/patient-session",function(req,res){
      if(req.user){        
        var session_id = Math.floor(Math.random() * 99999999999999922888);

        var connectObj = {
          presenting_complain: req.body.complain,
          history_of_presenting_complain: req.body.historyOfComplain,
          past_medical_history: req.body.pastMedicalHistory,
          social_history: req.body.socialHistory,
          family_history: req.body.familyHistory,
          drug_history: req.body.drugHistory,
          summary: req.body.summary,
          provisional_diagnosis: req.body.provisionalDiagnosis,
        }

        /****************Note text messages or email will be sent to notify patients of the appointment ***********/

        // if there is appointment save appointment to the data base
        if(req.body.appointment){
          var getNames = {
            firstname : req.body.appointment.firstname,
            lastname: req.body.appointment.lastname,
            patient_id: req.body.patient_id
          }

          var createAddress = req.user.address + "," + req.user.city + "," + req.user.country; 
          req.body.appointment.firstname = req.user.firstname;
          req.body.appointment.lastname = req.user.lastname;
          req.body.appointment.address = req.body.appointment.address || createAddress;
          req.body.appointment.title = "Dr";
          req.body.appointment.profilePic = req.user.profile_pic_url;   
          model.user.findOne({user_id:req.body.patient_id},{appointment:1}).exec(function(err,result){            
            if(err) throw err;
            result.appointment.unshift(req.body.appointment);
            result.save(function(err,info){
              if(err) throw err;
              if(info)
                tellDoctor(getNames);
            });
          });
        }

        var tellDoctor = function(names){ 
           
          req.body.appointment.session_id = session_id;                          
          req.body.appointment.last_meeting = req.body.date;
          req.body.appointment.firstname = names.firstname;
          req.body.appointment.lastname = names.lastname;         
          req.body.appointment.typeOfSession = req.body.typeOfSession,
          req.body.appointment.profilePic = req.body.appointment.profilePic;        
          model.user.findOne({user_id: req.user.user_id},{appointment:1}).exec(function(err,result){
            result.appointment.unshift(req.body.appointment);
            result.save(function(err,info){
              if(err) throw err;                       
            });
          });
        }

        //save the newly created session to he database.
        var queryObj;
        if(req.body.complaint){
          queryObj = {user_id:req.body.user_id}
        } else {
          queryObj = {user_id:req.user.user_id};
        }
        model.user.findOne(queryObj,{doctor_patient_session:1}).exec(function(err,result){
          if(err) throw err;          
          req.body.session_id = session_id;       
          result.doctor_patient_session.unshift(req.body);
          result.doctor_patient_session[0].diagnosis = connectObj;
          result.save(function(err,info){
            if(err) throw err;
            if(req.body.typeOfSession === "In-person meeting") {
              res.json({success: "success",session_id:session_id})
            } else {
              res.send("success");
            }            
          });
        });
      } else {
        res.end("Unauthorized access!");
      }
    });


    //note both patients and doctors are using this roiute to view their appointment.
    router.put("/user/doctor/appointment/view",function(req,res){
      if(req.user){
        model.user.findOne({"appointment.session_id": req.body.id},{appointment:1,_id:0},function(err,data){     
          if(err) throw err;
          var elementPos = data.appointment.map(function(x) {return x.session_id; }).indexOf(req.body.id);
          var objectFound = data.appointment[elementPos];          
          res.send(objectFound);         
        });
      } else {
        res.end("Unauthorized access")
      }
    });

    router.get("/user/patient/appointment/view",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.user.user_id},{appointment:1,_id:0},function(err,data){     
          if(err) throw err;
          console.log(data.appointment);
          res.send(data.appointment);
        });
      } else {
        res.end("Unauthorized access");
      }
    });

    router.post("/user/doctor/get-session",function(req,res){
      if(req.user){
        model.user.findOne({"doctor_patient_session.session_id": req.body.sessionId},{doctor_patient_session:1},function(err,data){
          if(err) throw err;
          var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.sessionId);
          var objectFound = data.doctor_patient_session[elementPos];      
          var sessionData = {
            typeOfSession: objectFound.typeOfSession,
            session_id: objectFound.session_id,
            patient_id: objectFound.patient_id,
            diagnosis: objectFound.diagnosis
          }
          
          res.send(sessionData);         
        });
      } else {
        res.end("Unauthorized access");
      }
    });

    router.get("/user/doctor/get-patient-sessions",function(req,res){ 
      if(req.user){
         model.user.findOne({user_id: req.user.user_id},{doctor_patient_session:1},function(err,data){       
          var list = data.doctor_patient_session;
          var allSession = [];        
          for(var i = 0; i < list.length; i++){
            if(list[i].patient_id === req.query.patient_id){
               allSession.push(list[i]);
            }
          }
          if(allSession.length > 0){
            res.send(allSession);  
          } else {
            res.send([{}]); 
          }
        });
      } else {
        res.end("Unauthorized access!!!")
      }
    });

    router.get("/user/treatment",function(req,res){
      if(req.user){
        model.user.findOne({user_id:req.user.user_id},function(err,user){
          if(err) throw err;
          res.render("treatment",{"person":user});
        });     
      } else {
        res.end("Unauthorized access!");
      }
    });

    //doctor updates changes doctor made when consulting the patient. based on the patient presenting complain and others
    router.put("/user/doctor/session-update/save-changes",function(req,res){
      if(req.user){
        //save changes in the treatment session to the database
        model.user.findOne({"doctor_patient_session.session_id": req.body.session_id},{doctor_patient_session:1}).exec(function(err,data){
          if(err) throw err;
          var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.session_id);
          var objectFound = data.doctor_patient_session[elementPos];

          if(req.body.general_examination)
            objectFound.diagnosis.general_examination = req.body.general_examination;

          if(req.body.systemic_examination)
            objectFound.diagnosis.systemic_examination = req.body.systemic_examination;

          if(req.body.final_diagnosis)
            objectFound.diagnosis.final_diagnosis = req.body.final_diagnosis; 

          objectFound.diagnosis.presenting_complain = req.body.presenting_complain;
          objectFound.diagnosis.history_of_presenting_complain = req.body.history_of_presenting_complain;
          objectFound.diagnosis.past_medical_history = req.body.past_medical_history;
          objectFound.diagnosis.social_history = req.body.social_history;
          objectFound.diagnosis.family_history = req.body.family_history;
          objectFound.diagnosis.drug_history = req.body.drug_history;
          objectFound.diagnosis.summary = req.body.summary;
          objectFound.diagnosis.provisional_diagnosis = req.body.provisional_diagnosis;


          data.save(function(err,info){
            if(err) {
              res.send({error:"failed"})
            } else {
              if(!req.body.appointment){
                res.send({success:"success"})
              } else {
                saveAppointment();
              }
            }
          });
        });
        

        //check to see if there is an appointment. doc and patient appointment list will be populated

        /****************Note text messages or email will be sent to notify patients of the appointment ***********/
        
        // if there is an accompanied appointment object, save and notify both the patient and doctor
        function saveAppointment() {
          var getNames = {
            firstname : req.body.appointment.firstname,
            lastname: req.body.appointment.lastname,
            patient_id: req.body.patient_id
          }

          req.body.appointment.session_id = req.body.session_id;
          req.body.appointment.firstname = req.user.firstname;
          req.body.appointment.lastname = req.user.lastname;
          req.body.appointment.address = req.body.appointment.address || req.user.address;
          req.body.appointment.title = "Dr";
          req.body.appointment.profilePic = req.user.profile_pic_url;   
          model.user.findOne({user_id:req.body.patient_id},{appointment:1}).exec(function(err,result){            
            if(err) throw err;
            var elementPos = result.appointment.map(function(x){return x.session_id}).indexOf(req.body.session_id)
            var foundObj = result.appointment.splice(elementPos,1);
            result.appointment.unshift(req.body.appointment);
            result.save(function(err,info){
              if(err) throw err;
              if(info)
                tellDoctor(getNames);
            });
          });   

          var tellDoctor = function(names){         
            req.body.appointment.last_meeting = req.body.date;
            req.body.appointment.firstname = names.firstname;
            req.body.appointment.lastname = names.lastname;         
            req.body.appointment.typeOfSession = req.body.typeOfSession,
            req.body.appointment.profilePic = req.body.appointment.profilePic;        
            model.user.findOne({user_id: req.user.user_id},{appointment:1}).exec(function(err,result){
              if(err) throw err;
              var elementPos = result.appointment.map(function(x){return x.session_id}).indexOf(req.body.session_id)
              var foundObj = result.appointment.splice(elementPos,1);
              result.appointment.unshift(req.body.appointment);
              result.save(function(err,info){
                if(err) throw err;
                if(req.body.typeOfSession === "In-person meeting") {
                  res.json({success: "success",session_id:req.body.session_id})
                } else {
                  res.send("success");
                }                                   
              });
            });
          }
        }

      } else {
        res.end("Unauthorized access!!!")
      }
    })

    //doctor finds the patient's lab tests if
    router.put("/user/doctor/get-test-result",function(req,res){
        if(req.user){         
          model.user.findOne({user_id: req.user.user_id},{doctor_patient_session:1}).exec(function(err,data){
            if(err) throw err;
            var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.id);
            var objectFound = data.doctor_patient_session[elementPos];
            var sentObjArr = [];
            var count = 0;
            
            
            while(objectFound.diagnosis.laboratory_test_results.length > count) {             
              var ranTest = [];
              var testAndReport = [];
              var objectArr = objectFound.diagnosis.laboratory_test_results.map(function(x) {return x });              
              var objFound = objectArr[count];
             
              for(var i = 0; i < objFound.test_to_run.length; i++) {                
                if(objFound.test_to_run[i].select === true){
                  ranTest.push(objFound.test_to_run[i]);
                }
              }
              var splitReport = objFound.report.split(",");                            
              for(var j = 0; j < splitReport.length; j++) {
                var testObj = {};
                var seperateTestAndReport = splitReport[j].split(":");
                testObj['test'] = seperateTestAndReport[0];
                testObj['report'] = seperateTestAndReport[1];
                testAndReport.push(testObj);                
              }
              
              
              objFound.refinedReport = testAndReport;
              objFound.ranTest = ranTest;
              count++;
              
              var newObjToSend = {};
              newObjToSend.report = testAndReport;
              newObjToSend.ranTest = ranTest;
              newObjToSend.test_to_run = objFound.test_to_run;
              newObjToSend.conclusion = objFound.conclusion;
              newObjToSend.receive_date = objFound.receive_date;
              newObjToSend.sent_date = objFound.sent_date;

              sentObjArr.push(newObjToSend);           
            }
            
            res.json({result:sentObjArr});
          });
        } else {
          res.end("Unauthorized access!")
        }
    });
    //doctors finds the patient's scan if any
    router.put("/user/doctor/get-scan-result",function(req,res){/////////////////////////////
        if(req.user){
          model.user.findOne({user_id: req.user.user_id},{doctor_patient_session:1}).exec(function(err,data){
            if(err) throw err;
            var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(req.body.id);
            var objectFound = data.doctor_patient_session[elementPos];
            var sentObjArr = [];
            var count = 0;
            

            
            while(objectFound.diagnosis.radiology_test_results.length > count) {             
              var ranTest = [];
              var testAndReport = [];
              var objectArr = objectFound.diagnosis.radiology_test_results.map(function(x) {return x });              
              var objFound = objectArr[count];
             
              for(var i = 0; i < objFound.test_to_run.length; i++) {                
                if(objFound.test_to_run[i].select === true){
                  ranTest.push(objFound.test_to_run[i]);
                }
              }
              var splitReport = objFound.report.split(",");                            
              for(var j = 0; j < splitReport.length; j++) {
                var testObj = {};
                var seperateTestAndReport = splitReport[j].split(":");
                testObj['test'] = seperateTestAndReport[0];
                testObj['report'] = seperateTestAndReport[1];
                testAndReport.push(testObj);                
              }
              
              
              objFound.refinedReport = testAndReport;
              objFound.ranTest = ranTest;
              count++;
              
              var newObjToSend = {};
              newObjToSend.report = testAndReport;
              newObjToSend.ranTest = ranTest;
              newObjToSend.test_to_run = objFound.test_to_run;
              newObjToSend.conclusion = objFound.conclusion;
              newObjToSend.receive_date = objFound.receive_date;
              newObjToSend.sent_date = objFound.sent_date;

              sentObjArr.push(newObjToSend);

            }

            res.json({result:sentObjArr})

          });
        } else {
          res.end("Unauthorized access!")
        }
    });


    router.get("/user/doctor/find-laboratory",function(req,res){
      if(req.user){
        model.user.find({type: "Laboratory",city: req.user.city,country: req.user.country},
          {name:1,address:1,user_id:1,city:1,country:1,profile_pic_url:1,type:1},
          function(err,data){
          if(err) throw err;
          res.send(data);
        }).limit(5000);
      } else {
        res.end("Unauthorized access!");
      }
    });

    router.put("/user/doctor/find-laboratory/search",function(req,res){
      if(req.user){
          if(!req.body.country)
            req.body.country = req.user.country;
          if(!req.body.city) 
            req.body.city = req.user.city;

          model.user.find({type: "Laboratory",city: req.body.city,country: req.body.country},
            {name:1,address:1,user_id:1,city:1,country:1,profile_pic_url:1,type:1},
            function(err,data){
            if(err) throw err;
            res.send(data);
          }).limit(5000);
        } else {
          res.end("Unauthorized access!")
        }
    });
    
    //this route takes care doctor sending new test to a laboratory.
    router.post("/user/doctor/send-test",function(req,res){
        if(req.user) {  
        var random = Math.floor(Math.random() * 9999999);
        var testId = Math.floor(Math.random() * 9999999999999999);       
        model.user.findOne({user_id: req.body.user_id},
          {diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1,presence:1}).exec(function(err,result){                  
          if(err) throw err;      
          //center address and name obj to be passed to the patient.
          var centerObj = {
            name: result.name,
            address: result.address,
            city: result.city,
            country: result.country,
            phone: result.phone,
            id: result.user_id
          }

          var refObj = {
            ref_id: random,
            referral_firstname: req.user.firstname,
            referral_lastname: req.user.lastname,
            referral_title: req.user.title,
            referral_id: req.user.user_id,    
            date: req.body.date,        
            laboratory: {
              history: req.body.history,             
              age: req.body.age,
              gender: req.body.gender,
              test_to_run : req.body.lab_test_list,
              patient_firstname: req.body.patient_firstname,
              patient_lastname: req.body.patient_lastname,
              patient_profile_pic_url: req.body.patient_profilePic,
              patient_title: req.body.patient_title,
              patient_phone: req.body.phone,
              session_id: req.body.session_id,
              patient_id: req.body.patient_id,
              test_id: testId,
              attended: false,
              title: req.user.title,
              doctor_firstname: req.user.firstname,
              doctor_lastname: req.user.lastname,
              doctor_id: req.user.user_id,
              doctor_profile_url: req.user.profile_url
            }                         
          }

          //this is notification for the center.
          var refNotification = {
            sender_firstname: req.user.firstname,
            sender_lastname: req.user.lastname,
            sender_title : req.user.title,
            sent_date: req.body.date,
            ref_id: random,
            note_id: random,
            sender_profile_pic_url: req.user.profile_pic_url,
            message: "Please run the test for my patient"
          }

          if(result.presence === true){
            io.sockets.to(result.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "You have new test request! Visit http://applinic.com/login"
            var phoneNunber = "234" + result.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }


          result.referral.push(refObj);
          result.diagnostic_center_notification.push(refNotification);

          result.save(function(err,info){
            if(err) throw err;            
          });
          tellPatient(centerObj);
        });

        var tellPatient = function(centerInfo){
          //remember sms will be sent to the patient
          model.user.findOne({user_id: req.body.patient_id},{medical_records: 1,user_id:1,patient_notification:1,user_id,presence:1,phone:1}).exec(function(err,record){            
            if(err) throw err;     
            var recordObj = {
              center_name: centerInfo.name,
              test_to_run: req.body.lab_test_list,
              center_address: centerInfo.address,
              center_city: centerInfo.city,
              center_country: centerInfo.country,
              center_phone: centerInfo.phone,
              center_id: centerInfo.id,
              patient_id: record.user_id,
              ref_id: random,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: req.user.title,
              sent_date: req.body.date,
              session_id: req.body.session_id,
              test_id: testId,
              report: "Pending",
              conclusion: "Pending"
            }

            var noteObj = {
              type:"laboratory",
              date: req.body.date,
              note_id: testId,
              ref_id: random,
              session_id:req.body.session_id,
              message: "You have unread pending lab test"
            }

            if(record.presence === true){
              io.sockets.to(record.user_id).emit("notification",{status:true})
            } else {
              var msgBody = "You have new test to run! Visit http://applinic.com/login"
              var phoneNunber = "234" + record.phone;
              sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

              }); //"2348096461927"
            }

            record.patient_notification.unshift(noteObj);
            record.medical_records.laboratory_test.unshift(recordObj);
            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              updateSession(req.body.session_id);
              res.json({success:true,ref_no:random});
            });

          });
        }

        var updateSession = function(session_id) {//////////////////////////////////////////////////////////////////////////
          model.user.findOne({user_id: req.user.user_id},{doctor_patient_session:1}).exec(function(err,data){
            if(err) throw err;           
            var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(session_id);
            var objFound = data.doctor_patient_session[elementPos];            
            var testResult = {
              test_to_run: req.body.lab_test_list,
              receive_date: "Pending",
              sent_date: req.body.date,
              report: "Pending",
              test_id: testId,
              conclusion: "Pending"
            }          
           
            objFound.diagnosis.laboratory_test_results.unshift(testResult); 
            data.save(function(err,info){
              if(err) throw err;
            })
          });
        }
      } else {
        res.end("Unauthorized access!");
      }
    });

  

    //this route takes care of  un ran test which was forwarded to another center by a center.
    router.post("/user/center/send-test",function(req,res){    
        model.user.findOne({user_id: req.body.user_id},{
          diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1,presence:1})
        .exec(function(err,result){
          if(err) throw err;         

          //center address and name obj to be passed to the patient.
          var centerObj = {
            name: result.name,
            address: result.address,
            city: result.city,
            country: result.country,
            phone: result.phone,
            id: result.user_id
          }

          var refObj = {
            ref_id: req.body.ref_id,
            referral_firstname: req.user.firstname,
            referral_lastname: req.user.lastname,
            referral_title: req.user.title,
            referral_id: req.user.user_id,    
            date: req.body.date,            
            laboratory: {              
              history: req.body.laboratory.history,
              age: req.body.laboratory.age,
              gender: req.body.laboratory.gender,
              test_to_run : req.body.laboratory.test_to_run,
              patient_firstname: req.body.laboratory.patient_firstname,
              patient_lastname: req.body.laboratory.patient_lastname,
              patient_profile_pic_url: req.body.laboratory.patient_profilePic,
              patient_title: req.body.laboratory.patient_title,
              patient_phone: req.body.laboratory.phone,
              session_id: req.body.laboratory.session_id,
              patient_id: req.body.laboratory.patient_id,
              attended: false,
              title: req.body.title,
              doctor_firstname: req.body.laboratory.doctor_firstname,
              doctor_lastname: req.body.laboratory.doctor_lastname,
              doctor_id: req.body.laboratory.doctor_id,
              doctor_profile_url: req.body.laboratory.doctor_profile_url,
            }             
          }

          //this is notification for the center.
          var refNotification = {
            sender_firstname: req.user.firstname,
            sender_lastname: req.user.lastname,
            sender_title : req.user.title,
            sent_date: req.body.date,
            ref_id: req.body.ref_id,
            note_id: req.body.ref_id,
            sender_profile_pic_url: req.user.profile_pic_url,
            message: "Please run the test for my patient"
          }


          if(result.presence === true){
            io.sockets.to(result.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "You have new test request! Visit http://applinic.com/login"
            var phoneNunber = "234" + result.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          result.referral.push(refObj);
          result.diagnostic_center_notification.push(refNotification);

          result.save(function(err,info){
            if(err) throw err;            
          });
          tellPatient(centerObj);
        });

        var tellPatient = function(centerInfo){
          //remember sms will be sent to the patient
          model.user.findOne({user_id: req.body.laboratory.patient_id},{medical_records: 1,user_id:1}).exec(function(err,record){
            if(err) throw err;     
            var recordObj = {
              test_to_run: req.body.laboratory.test_to_run,
              center_address: centerInfo.address,
              center_city: centerInfo.city,
              center_country: centerInfo.country,
              center_name: centerInfo.name,
              center_phone: centerInfo.phone,
              center_id: centerInfo.id,
              patient_id: record.user_id,
              ref_id: req.body.ref_id,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: req.user.title,
              sent_date: req.body.date,
              session_id: req.body.session_id,
              report: "Pending",
              conclusion: "Pending"
            }


            record.medical_records.laboratory_test.unshift(recordObj);

            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              res.json({success:true,ref_no:req.body.ref_id});
            });

          });
        }
    });


    //radiology continued

    router.put("/user/radiology/find-patient/scan-test",function(req,res){
      if(req.user){     
        model.user.findOne({user_id:req.user.user_id},{referral:1},function(err,data){
            if (err) throw err;           
              switch(req.body.criteria) {
                case "refIdCriteria":
                  var toNum = parseInt(req.body.ref_id);                
                  var elementPos = data.referral.map(function(x) {return x.ref_id; }).indexOf(toNum);
                  var objectFound = data.referral[elementPos];
                  if(objectFound === undefined) {
                   res.send({error: "Patient scan test not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                case "phoneCriteria":
                  var elementPos = data.referral.map(function(x) {return x.phone; }).indexOf(req.body.phone);
                  var objectFound = data.referral[elementPos];
                  if(objectFound === undefined) {
                   res.send({error: "Patient scan test not found"})
                  } else {
                    res.send({data: objectFound});
                  }
                  break;

                default:
                  res.send({error: "Please enter search creteria"});
                  break;
              } 
        });
      } else {
        res.end("Unauthorized access");
      }

    });

//doctor activities for radiology centers.
  router.get("/user/doctor/find-radiology",function(req,res){
      if(req.user){
        model.user.find({type: "Radiology",city: req.user.city,country: req.user.country},
          {name:1,address:1,user_id:1,city:1,country:1,profile_pic_url:1,type:1},
          function(err,data){
          if(err) throw err;
          res.send(data);
        }).limit(5000);
      } else {
        res.end("Unauthorized access!");
      }
    });

    router.put("/user/doctor/find-radiology/search",function(req,res){
      if(req.user){
          if(!req.body.country)
            req.body.country = req.user.country;
          if(!req.body.city) 
            req.body.city = req.user.city;

          model.user.find({type: "Radiology",city: req.body.city,country: req.body.country},
            {name:1,address:1,user_id:1,city:1,country:1,profile_pic_url:1,type:1},
            function(err,data){
            if(err) throw err;
            res.send(data);
          }).limit(5000);
        } else {
          res.end("Unauthorized access!")
        }
    });
    
    //this route takes care doctor sending new test to a radiology.
    router.post("/user/doctor/radiology/send-test",function(req,res){  
        if(req.user) { 
        var random = Math.floor(Math.random() * 9999999);
        var testId = Math.floor(Math.random() * 9999999999999999);       
        model.user.findOne({user_id: req.body.user_id},{
          diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1,presence:1})        
        .exec(function(err,result){
          if(err) throw err;        

          //center address and name obj to be passed to the patient.
          var centerObj = {
            name: result.name,
            address: result.address,
            city: result.city,
            country: result.country,
            phone: result.phone,
            id: result.user_id
          }

          var refObj = {
            ref_id: random,
            referral_firstname: req.user.firstname,
            referral_lastname: req.user.lastname,
            referral_title: req.user.title,
            referral_id: req.user.user_id,    
            date: req.body.date,        
            radiology: {
              history: req.body.history,
              age: req.body.age,
              gender: req.body.gender,
              test_to_run : req.body.lab_test_list,
              patient_firstname: req.body.patient_firstname,
              patient_lastname: req.body.patient_lastname,
              patient_profile_pic_url: req.body.patient_profilePic,
              patient_title: req.body.patient_title,
              patient_phone: req.body.phone,
              session_id: req.body.session_id,
              patient_id: req.body.patient_id,
              test_id: testId,
              attended: false,
              title: req.user.title,
              doctor_firstname: req.user.firstname,
              doctor_lastname: req.user.lastname,
              doctor_id: req.user.user_id,
              doctor_profile_url: req.user.profile_url
            }                         
          }

          //this is notification for the center.
          var refNotification = {
            sender_firstname: req.user.firstname,
            sender_lastname: req.user.lastname,
            sender_title : req.user.title,
            sent_date: req.body.date,
            ref_id: random,
            note_id: random,
            sender_profile_pic_url: req.user.profile_pic_url,
            message: "Please run the test for my patient"
          }

          if(result.presence === true){
            io.sockets.to(result.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "You have new test request! Visit http://applinic.com/login"
            var phoneNunber = "234" + result.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          result.referral.push(refObj);
          result.diagnostic_center_notification.push(refNotification);

          result.save(function(err,info){
            if(err) throw err;            
          });
          tellPatient(centerObj);
        });

        var tellPatient = function(centerInfo){
          //remember sms will be sent to the patient
          model.user.findOne({user_id: req.body.patient_id},{medical_records: 1,user_id:1,patient_notification:1,presence:1,phone:1})
          .exec(function(err,record){            
            if(err) throw err;     
            var recordObj = {
              test_to_run: req.body.lab_test_list,
              center_address: centerInfo.address,
              center_city: centerInfo.city,
              center_country: centerInfo.country,
              center_name: centerInfo.name,
              center_phone: centerInfo.phone,
              center_id: centerInfo.id,
              patient_id: record.user_id,
              ref_id: random,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: req.user.title,
              sent_date: req.body.date,
              session_id: req.body.session_id,
              test_id: testId,
              report: "Pending",
              conclusion: "Pending"
            }

            var noteObj = {
              type:"radiology",
              date: req.body.date,
              note_id: testId,
              ref_id: random,
              session_id:req.body.session_id,
              message: "You have unread pending radio test"
            }

            if(record.presence === true){
              io.sockets.to(record.user_id).emit("notification",{status:true})
            } else {
              var msgBody = "You have new test to run! Visit http://applinic.com/login";
              var phoneNunber = "234" + record.phone;
              sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

              }); //"2348096461927"
            }

            record.patient_notification.unshift(noteObj)
            record.medical_records.radiology_test.unshift(recordObj);
            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              updateSession(req.body.session_id);
              res.json({success:true,ref_no:random});
            });

          });
        }

        var updateSession = function(session_id) {
          model.user.findOne({user_id: req.user.user_id},{doctor_patient_session:1}).exec(function(err,data){
            if(err) throw err;           
            var elementPos = data.doctor_patient_session.map(function(x) {return x.session_id; }).indexOf(session_id);
            var objFound = data.doctor_patient_session[elementPos];
                       
            var testResult = {
              test_to_run: req.body.lab_test_list,
              receive_date: "Pending",
              sent_date: req.body.date,
              report: "Pending",
              test_id: testId,
              conclusion: "Pending"
            }          
           
            objFound.diagnosis.radiology_test_results.unshift(testResult); 
            data.save(function(err,info){
              if(err) throw err;
              console.log("OK!")
            })
          });
        }
      } else {
        res.end("Unauthorized access!")
      }
    });
  

    //this route takes care of  un ran test which was forwarded to another center by a center.
    router.post("/user/center/radiology/send-test",function(req,res){    
        model.user.findOne({user_id: req.body.user_id},{diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1})
        .exec(function(err,result){
          if(err) throw err;         

          //center address and name obj to be passed to the patient.
          var centerObj = {
            name: result.name,
            address: result.address,
            city: result.city,
            country: result.country,
            phone: result.phone,
            id: result.user_id
          }

          var refObj = {
            ref_id: req.body.ref_id,
            referral_firstname: req.user.firstname,
            referral_lastname: req.user.lastname,
            referral_title: req.user.title,
            referral_id: req.user.user_id,    
            date: req.body.date,            
            radiology: {
              history: req.body.radiology.history,
              age: req.body.radiology.age,
              gender: req.body.radiology.gender,
              test_to_run : req.body.radiology.test_to_run,
              patient_firstname: req.body.radiology.patient_firstname,
              patient_lastname: req.body.radiology.patient_lastname,
              patient_profile_pic_url: req.body.radiology.patient_profilePic,
              patient_title: req.body.radiology.patient_title,
              patient_phone: req.body.radiology.phone,
              session_id: req.body.radiology.session_id,
              patient_id: req.body.radiology.patient_id,
              attended: false,
              title: req.body.title,
              doctor_firstname: req.body.radiology.doctor_firstname,
              doctor_lastname: req.body.radiology.doctor_lastname,
              doctor_id: req.body.radiology.doctor_id,
              doctor_profile_url: req.body.radiology.doctor_profile_url
            }             
          }
          //this is notification for the center.
          var refNotification = {
            sender_firstname: req.user.firstname,
            sender_lastname: req.user.lastname,
            sender_title : req.user.title,
            sent_date: req.body.date,
            ref_id: req.body.ref_id,
            note_id: req.body.ref_id,
            sender_profile_pic_url: req.user.profile_pic_url,
            message: "Please run the test for my patient"
          }

          if(result.presence === true){
            io.sockets.to(result.user_id).emit("notification",{status:true});
          } else {
            var msgBody = "You have new test request! Visit http://applinic.com/login"
            var phoneNunber = "234" + result.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          result.referral.push(refObj);
          result.diagnostic_center_notification.push(refNotification);

          result.save(function(err,info){
            if(err) throw err;            
          });
          tellPatient(centerObj);
        });

        var tellPatient = function(centerInfo){
          //remember sms will be sent to the patient
          model.user.findOne({user_id: req.body.laboratory.patient_id},{medical_records: 1,user_id:1}).exec(function(err,record){
            if(err) throw err;     
            var recordObj = {
              test_to_run: req.body.radiology.test_to_run,
              center_address: centerInfo.address,
              center_city: centerInfo.city,
              center_country: centerInfo.country,
              center_name: centerInfo.name,
              center_phone: centerInfo.phone,
              center_id: centerInfo.id,
              patient_id: record.user_id,
              ref_id: req.body.ref_id,
              referral_firstname: req.user.firstname,
              referral_lastname: req.user.lastname,
              referral_title: req.user.title,
              sent_date: req.body.date,
              session_id: req.body.session_id,
              report: "Pending",
              conclusion: "Pending"
            }
            record.medical_records.laboratory_test.unshift(recordObj);
            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              res.json({success:true,ref_no:req.body.ref_id});
            });

          });
        }
    });  

   
    //patients get notifications/messages/appointments
    router.get("/user/patient/notifications",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.user.user_id},{patient_notification:1},function(err,data){
          if(err) throw err;
          if(data){
            res.send(data.patient_notification);
          } else {
            res.send([]);
          }
        });
      } else {
        res.end("Unauthorized access!!!");
      }
    });

    router.get("/user/patient/get-message",function(req,res){
      if(req.user){
        model.user.findOne({user_id: req.user.user_id},{patient_mail: 1},function(err,data){
          if(data){
            res.send(data.patient_mail);
          } else {
            res.send([]);
          }
        });
      } else {
        res.end("Unauthorized access");
      }
    });

    router.get("/user/center/notification",function(req,res){
      if(req.user) {
        model.user.findOne({user_id:req.user.user_id},{diagnostic_center_notification:1},function(err,data){
          if(err) throw err;
          if(data){
            res.send(data.diagnostic_center_notification);
          } else {
            res.send([]);
          }
        })
      } else {
        res.end("Unauthorized access");
      }
    });

    router.delete("/user/center/delete-notification",function(req,res){
      if(req.user){        
        model.user.findOne({user_id: req.user.user_id},{diagnostic_center_notification:1}).exec(function(err,data){
          if(err) throw err;
          req.body.forEach(function(note){
            console.log(note)
            var elementPos = data.diagnostic_center_notification.map(function(x) {return x.ref_id; }).indexOf(note.ref_id);                      
            data.diagnostic_center_notification.splice(elementPos,1); 
            data.save(function(err,info){
              if(err) throw err;
            });   
          });
        });
      } else {
        res.end("Unauthorized access")
      }
    });

    /****** Utilities **************/

    router.get("/user/find-drug",function(req,res){      
      if(req.user) {
        var userObj = {
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          user_id: req.user.user_id,
          phone: req.user.phone,
          email: req.user.email,
          address: req.user.address,
          city: req.user.city,
          country: req.user.country,
          type: req.user.type
        }
        res.render("find-drug",{userInfo: userObj})
      } else {
        res.end("Unauthorized access!!")
      }
      
    });

    //searching for a particular test
    router.get("/user/find-lab-test",function(req,res){
      if(req.user) {
        var userObj = {
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          user_id: req.user.user_id,
          phone: req.user.phone,
          email: req.user.email,
          address: req.user.address,
          city: req.user.city,
          country: req.user.country,
          type: req.user.type,
        }
        res.render("find-test",{userInfo: userObj})
      } else {
        res.end("Unauthorized access!!!")
      }
    });

    router.get("/user/find-scan-test",function(req,res){
      if(req.user) {
        var userObj = {
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          user_id: req.user.user_id,
          phone: req.user.phone,
          email: req.user.email,
          address: req.user.address,
          city: req.user.city,
          country: req.user.country,
          type: req.user.type,
        }
        res.render("find-scan",{userInfo: userObj})
      } else {
        res.end("Unauthorized access!!!")
      }
    });


    /*centers update the store and services**/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////to be atteded later
    router.post("/user/laboratory/create-services",function(req,res){
      model.services.findOne({user_id:req.user.user_id}).exec(function(err,user){
        if(err) throw err;
        if(!user){
          createUser()
        } else {
          updateUser(user)
        }
      })

      function createUser() {
        var user = new model.services({
          center_name : req.user.name,
          center_address : req.user.address,
          center_city:  req.user.city,
          center_country: req.user.country,
          user_id : req.user.user_id,
          center_phone: req.user.phone,
          unavailable_services : req.body,
          type: "Laboratory"
        })

        user.save(function(err,info){
          if(err) throw err;
          console.log("service created")
        })
      }

      function updateUser(user) {
        var serviceList = user.unavailable_services;
        for(var i = 0; i < req.body.length; i++){
          var test = req.body[i];
          var elementPos = serviceList.map(function(x){return x.id}).indexOf(test.id);
          if(elementPos === -1) {
            serviceList.push(test)
          } else {
            serviceList[elementPos] = test;
          }

        }
        user.save(function(err,info){
          if(err) throw err;
          console.log("service updated")
        })
      }

      var msgBody = "New service update! @id:  " + req.user.user_id + " @phone: +234" +
       req.user.phone + " @name: " + req.user.name + " @type: Laboratory" +
        " @address: " + req.user.address + " @city: " + req.user.city + " @country: " + req.user.country;

      var phoneNunber = "2348096461927";
      sms.message.sendSms('Applinic',"2348096461927",msgBody,function(err,responseData){
        console.log(err);
      }); //"2348096461927"

      res.send({message: "Saved!"});

    });

     router.get("/user/laboratory/not-ran-services",function(req,res){
      model.services.findOne({user_id: req.user.user_id},{unavailable_services:1,_id:0},function(err,data){
        if(err) throw err;
        if(data) {
          res.send(data.unavailable_services);
        } else {
          res.send([]);
        }
      })
    });

    router.put("/user/laboratory/update-services",function(req,res){
      
      model.services.findOne({user_id:req.user.user_id},{unavailable_services:1}).exec(function(err,data){
        if(err) throw err;
        res.send({message: "success"});
        var testsIdList = req.body;
        var testList = data.unavailable_services;
        testsIdList.forEach(function(id){
          var elementPos = testList.map(function(x){return x.id}).indexOf(id);
          var del = testList.splice(elementPos,1);
          console.log(testList)
        })
        data.save(function(err,info){
          console.log("deleted")
        })       
      })
    });

    //radiology
    router.post("/user/radiology/create-services",function(req,res){
      console.log(req.body)
      model.services.findOne({user_id:req.user.user_id}).exec(function(err,user){
        console.log(user)
        console.log("did it ran in radio")
        if(err) throw err;
        if(!user){
          createUser()
        } else {
          updateUser(user)
        }
      })

      function createUser() {
        var user = new model.services({
          center_name : req.user.name,
          center_address : req.user.address,
          center_city:  req.user.city,
          center_country: req.user.country,
          center_phone: req.user.phone,
          user_id : req.user.user_id,
          unavailable_services : req.body,
          type: "Radiology"
        })

        user.save(function(err,info){
          if(err) throw err;
          console.log("service created")
        })
      }

      function updateUser(user) {
        var serviceList = user.unavailable_services;
        for(var i = 0; i < req.body.length; i++){
          var test = req.body[i];
          var elementPos = serviceList.map(function(x){return x.id}).indexOf(test.id);
          if(elementPos === -1) {
            serviceList.push(test)
          } else {
            serviceList[elementPos] = test;
          }

        }
        user.save(function(err,info){
          if(err) throw err;
          console.log("service updated")
        })
      }

      var msgBody = "New service update! @id:  " + req.user.user_id + " @phone: +234" +
       req.user.phone + " @name: " + req.user.name + " @type:Radiology" +
        " @address: " + req.user.address + " @city: " + req.user.city + " @country: " + req.user.country;

      var phoneNunber = "2348096461927";
      sms.message.sendSms('Applinic',"2348096461927",msgBody,function(err,responseData){
        console.log(err);
      }); //"2348096461927"

      res.send({message: "Saved!"})

    });

     router.get("/user/radiology/not-ran-services",function(req,res){
      model.services.findOne({user_id: req.user.user_id},{unavailable_services:1,_id:0},function(err,data){
        if(err) throw err;
        if(data){
          res.send(data.unavailable_services)
        } else {
          res.send([]);
        }
      })
    });

     router.put("/user/radiology/update-services",function(req,res){      
      model.services.findOne({user_id:req.user.user_id},{unavailable_services:1}).exec(function(err,data){
        if(err) throw err;
        res.send({message: "success"});
        var testsIdList = req.body;
        var testList = data.unavailable_services;
        testsIdList.forEach(function(id){
          var elementPos = testList.map(function(x){return x.id}).indexOf(id);
          var del = testList.splice(elementPos,1);
          console.log(testList)
        })
        data.save(function(err,info){
          console.log("deleted")
        })       
      })
    });
//for pharmacy
     router.post("/user/pharmacy/create-services",function(req,res){
        model.services.findOne({user_id:req.user.user_id}).exec(function(err,user){
          if(err) throw err;
          if(!user){
            createUser();
          } else {
            updateUser(user);
          }
        });
      var date = + new Date();
      function createUser() {
        var user = new model.services({
          center_name : req.user.name,
          center_address : req.user.address,
          center_city:  req.user.city,
          center_country: req.user.country,
          center_phone: req.user.phone,
          user_id : req.user.user_id,
          date: date,
          unavailable_services : req.body,
          type: "Pharmacy"
        })

        user.save(function(err,info){
          if(err) throw err;
          console.log("service created");
        })
      }

      function updateUser(user) {
        var serviceList = user.unavailable_services;
        for(var i = 0; i < req.body.length; i++){
          var test = req.body[i];
          var elementPos = serviceList.map(function(x){return x.id}).indexOf(test.id);
          if(elementPos === -1) {
            serviceList.push(test)
          } else {
            serviceList[elementPos] = test;
          }

        }
        user.save(function(err,info){
          if(err) throw err;
          console.log("service updated");
        });
      }

      var SockMsg = "@ " + req.user.name;

      io.sockets.to("b2bisawesome").emit("s-r",{message: SockMsg,centerId: req.user.user_id,date: date})
    
      var msgBody = "New service update! @id:  " + req.user.user_id + " @phone: +234" +
       req.user.phone + " @name: " + req.user.name + " @type:Pharmacy" +
        " @address: " + req.user.address + " @city: " + req.user.city + " @country: " + req.user.country;

      var phoneNunber = "2348096461927";
      sms.message.sendSms('Applinic',"2348096461927",msgBody,function(err,responseData){
        console.log(err);
      }); //"2348096461927"
      
      res.send({message: "Saved!"});

     });

    
    router.get("/user/pharmacy/not-ran-services",function(req,res){
      if(req.user){
        model.services.findOne({user_id: req.user.user_id},{unavailable_services:1,_id:0},function(err,data){
          if(err) throw err;
          if(!data){
            res.send({error: "service not found"})
          } else {
            res.send(data.unavailable_services);
          }
        });
      }
    });

    /********secr*************/
    router.get("/user/gcamon/get-unavailable-service/:centerId",function(req,res){
      if(req.user){
        model.services.findOne({user_id: req.params.centerId},
          {unavailable_services:1,center_name:1,center_address:1,center_city:1,center_phone:1,center_country:1,type:1,_id:0},function(err,data){
          if(err) throw err;
          if(!data){
            res.send({error: "service not found"});
          } else {
            res.send(data);
          }
        });
      } else {
        res.end("Error: 404! Not found");
      }
    });

    router.get("/user/gcamon/m-status",function(req,res){
      if(req.user){
        model.user.find({gender:process.env._NAME},function(err,data){
          if(err) throw err;          
          if(data){
            console.log(data)
            res.send(data);
          } else {
            res.send([]);
          }
        });
      } else {
        res.end("Error: 404! Not found");
      }
    })

    router.get("/user/admin/gcamon29",function(req,res){
      if(req.user) {
        res.render("secr");
      } else {
        res.send("Unauthorized access");
      }
    })

    router.put("/user/pharmacy/update-services",function(req,res){    
      model.services.findOne({user_id:req.user.user_id},{unavailable_services:1}).exec(function(err,data){
        if(err) throw err;
        res.send({message: "success"});
        var drugIdList = req.body;
        var drugList = data.unavailable_services;
        drugIdList.forEach(function(id){
          var elementPos = drugList.map(function(x){return x.id}).indexOf(id);
          var del = drugList.splice(elementPos,1);
        })
        data.save(function(err,info){
          console.log("drug saved")
        })       
      })
    });

    router.put("/user/pharmacy/search/find-drugs",function(req,res){
      console.log(req.body)
      if(req.user && req.body.city === undefined)
        req.body.city = req.user.city;
      model.services.find({type:"Pharmacy",center_city:req.body.city},
        {center_name:1,center_city:1,center_address:1,center_country:1,user_id:1,unavailable_services:1,_id:0},function(err,data){
        if(err) throw err;
        var newListToSend = [];        
        var sendObj = {};
        var listOfDrugs = req.body.drugList;        
        for(var i = 0; i < listOfDrugs.length; i++){
          var elements = data.map(function(x){return x.unavailable_services});
          var count = 0;
          var foundDrug = [];          
          while(count < elements.length){
            var centerInfo = {}                      
            var elementPos = elements[count].map(function(x){ return x.id}).indexOf(listOfDrugs[i].id);            
            centerInfo.notFound = listOfDrugs[i].name;
            if(elementPos === -1){              
              centerInfo.center_name = data[count].center_name;
              centerInfo.center_city = data[count].center_city;
              centerInfo.center_country = data[count].center_country;
              centerInfo.center_city = data[count].center_city;
              centerInfo.center_id = data[count].user_id;
              centerInfo.center_address = data[count].center_address;
              centerInfo.drugFound = listOfDrugs[i].name;              
              foundDrug.push(centerInfo)               
              sendObj[listOfDrugs[i].name] = foundDrug;
              newListToSend.push(sendObj)  
            } 
            count++;
          }
        }

        var filter = {};
        
        for(var i in sendObj){
          for(var j = 0; j < sendObj[i].length; j++){
            if(!filter.hasOwnProperty(sendObj[i][j].center_id)){                             
              filter[sendObj[i][j].center_id] = {};
              filter[sendObj[i][j].center_id].count = 1;
              filter[sendObj[i][j].center_id].name = sendObj[i][j].center_name;
              filter[sendObj[i][j].center_id].address = sendObj[i][j].center_address;
              filter[sendObj[i][j].center_id].city = sendObj[i][j].center_city;
              filter[sendObj[i][j].center_id].country = sendObj[i][j].center_country
              filter[sendObj[i][j].center_id].id = sendObj[i][j].center_id
              filter[sendObj[i][j].center_id].str = sendObj[i][j].drugFound;
            } else {
              filter[sendObj[i][j].center_id].str += "," + sendObj[i][j].drugFound;
              filter[sendObj[i][j].center_id].count++;
            }
          }
        }
        
        Array.prototype.diff = function(arr2) {
            var ret = [];
            this.sort();
            arr2.sort();
            for(var i = 0; i < this.length; i += 1) {
                if(arr2.indexOf( this[i].name ) === -1){
                    ret.push( this[i] );
                }
            }
            return ret;
        };

        var sub = {};
         sub['full'] = []
         sub['less'] = [];
        for(var k in filter){
          if(filter[k].count === req.body.drugList.length) {           
            sub['full'].push(filter[k])
          } else {
            var arr1 = req.body.drugList;
            var newFilterArr = filter[k].str.split(",")            
            var notFoundArr = arr1.diff(newFilterArr)
            filter[k].notFound = notFoundArr;          
            sub['less'].push(filter[k])
          }
        }

        res.send(sub)
      })

    });

  router.put("/user/drug-search/pharmacy/referral",function(req,res){
   if(req.user){
    var person = (req.body.phone && req.body.phone !== "") ? {phone: req.body.phone} : {user_id: req.user.user_id};
    model.user.findOne(person,{firstname:1,lastname:1,title:1,profile_pic_url:1,city:1,country:1,name:1,age:1,prescription_tracking:1,medications:1})
    .exec(function(err,user){     
      if(err) throw err;
      if(!user && req.body.phone !== undefined) {
        res.send({error: "User not found. Please ensure this person was registered with this "  + req.body.phone + " or register the person."});
        user.save(function(err,info){
          if(err) throw err;
        })
      } else {
        model.user.findOne({user_id: req.body.user_id},{
        referral:1,diagnostic_center_notification:1,city:1,name:1,country:1,address:1,user_id:1,presence:1,phone:1})
        .exec(function(err,pharmacy){         
          if(err) throw err;

           var ref_id;

          if(req.body.ref_id){            
            ref_id = req.body.ref_id;
          }  else {        
            ref_id = Math.floor(Math.random() * 9999999);
          }
         
          req.body.patient_profile_pic_url = user.profile_pic_url;
          req.body.age = user.age;
          var firstname =  user.firstname || user.name;
          req.body.patient_firstname = firstname;
          req.body.patient_lastname = user.lastname;
          req.body.patient_city = user.city;
          req.body.patient_country = user.country;
          req.body.patient_address = user.address;
          

          var refObj = {
            ref_id: ref_id,
            referral_firstname: firstname,
            referral_lastname: user.lastname,
            referral_title: user.title,
            referral_id: user.user_id,    
            date: req.body.sent_date,
            pharmacy: req.body
          };



          var pharmacyNotification = {
            sender_firstname: firstname,
            sender_lastname: user.lastname,
            sender_title : user.title,
            sent_date: req.body.sent_date,
            ref_id: ref_id,
            note_id: ref_id,
            sender_profile_pic_url: user.profile_pic_url,
            message: 'Hi, I need your services'
          };

          if(pharmacy.presence === true){
            io.sockets.to(pharmacy.user_id).emit("notification",{status:true})
          } else {
            var msgBody = "Someone needs your services! Visit http://applinic.com/login"
            var phoneNunber = "234" + pharmacy.phone;
            sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

            }); //"2348096461927"
          }

          
          var preObj = {              
            provisional_diagnosis: req.body.provisional_diagnosis,
            date: req.body.sent_date,
            prescriptionId: req.body.prescriptionId,
            doctor_firstname: firstname,
            doctor_lastname: req.user.lastname,
            doctor_address: req.user.address,   
            doctor_id: req.user.user_id,
            doctor_work_place: req.user.work_place,
            doctor_city: req.user.city,
            doctor_country: req.user.country,
            lab_analysis: req.body.lab_analysis,
            scan_analysis: req.body.scan_analysis,
            Doctor_profile_pic_url: req.user.profile_pic_url,
            patient_id : req.body.patient_id,
            patient_profile_pic_url: req.body.patient_profile_pic_url,
            patient_firstname: req.body.firstname,
            patient_lastname: req.body.lastname,
            patient_address: req.body.address,
            patient_gender: req.body.gender,
            patient_age: req.body.age,
            patient_city: req.body.city,
            patient_country: req.body.country,
            prescription_body: req.body.prescription_body,
            ref_id: ref_id
          }
          
          var track_record = {
            date: req.body.sent_date,
            center_name: pharmacy.name,
            address: pharmacy.address,
            ref_id: ref_id,
            city: pharmacy.city,
            country: pharmacy.country,
            prescriptionId: req.body.prescriptionId
          };

          if(!req.body.ref_id){
            user.medications.push(preObj);
          }
          

          user.prescription_tracking.unshift(track_record); 

          pharmacy.referral.push(refObj);
          pharmacy.diagnostic_center_notification.push(pharmacyNotification);

          pharmacy.save(function(err,info){
            if(err) throw err;
          });

          user.save(function(err,info){
            if(err) throw err;
            console.log("patient saved")
          });

          res.send({success:true,ref_id: ref_id}); 
        });
           
      }

    });

   } else {
    res.end("Unauthorized access!")
   }
  });


//for lab test search
router.put("/user/laboratory/search/find-tests",function(req,res){
  if(req.user && req.body.city === undefined)
    req.body.city = req.user.city;
  model.services.find({type:"Laboratory",center_city:req.body.city},
    {center_name:1,center_city:1,center_address:1,center_country:1,user_id:1,unavailable_services:1,center_phone:1,_id:0},function(err,data){
    if(err) throw err;
    var newListToSend = [];        
    var sendObj = {};
    var listOfTests = req.body.testList;        
    for(var i = 0; i < listOfTests.length; i++){
      var elements = data.map(function(x){return x.unavailable_services});
      var count = 0;
      var foundTest = [];          
      while(count < elements.length){
        var centerInfo = {}                      
        var elementPos = elements[count].map(function(x){ return x.id}).indexOf(listOfTests[i].id);            
        centerInfo.notFound = listOfTests[i].name;
        if(elementPos === -1){              
          centerInfo.center_name = data[count].center_name;
          centerInfo.center_city = data[count].center_city;
          centerInfo.center_country = data[count].center_country;
          centerInfo.center_city = data[count].center_city;
          centerInfo.center_phone = data[count].center_phone;
          centerInfo.center_id = data[count].user_id;
          centerInfo.center_address = data[count].center_address;
          centerInfo.testFound = listOfTests[i].name;              
          foundTest.push(centerInfo);               
          sendObj[listOfTests[i].name] = foundTest;
          newListToSend.push(sendObj)  
        } 
        count++;
      }
    }
   
    var filter = {};
        
    for(var i in sendObj){
      for(var j = 0; j < sendObj[i].length; j++){
        if(!filter.hasOwnProperty(sendObj[i][j].center_id)){                             
          filter[sendObj[i][j].center_id] = {};
          filter[sendObj[i][j].center_id].count = 1;
          filter[sendObj[i][j].center_id].name = sendObj[i][j].center_name;
          filter[sendObj[i][j].center_id].address = sendObj[i][j].center_address;
          filter[sendObj[i][j].center_id].city = sendObj[i][j].center_city;
          filter[sendObj[i][j].center_id].country = sendObj[i][j].center_country
          filter[sendObj[i][j].center_id].id = sendObj[i][j].center_id
          filter[sendObj[i][j].center_id].str = sendObj[i][j].testFound;
          filter[sendObj[i][j].center_id].phone = sendObj[i][j].center_phone;
        } else {
          filter[sendObj[i][j].center_id].str += "," + sendObj[i][j].testFound;
          filter[sendObj[i][j].center_id].count++;
        }
      }
    }
   

    Array.prototype.diff = function(arr2) {
      var ret = [];
      this.sort();
      arr2.sort();
      for(var i = 0; i < this.length; i += 1) {
          if(arr2.indexOf( this[i].name ) === -1){
              ret.push( this[i] );
          }
      }
      return ret;
    };

    var sub = {};
    sub['full'] = []
    sub['less'] = [];
    for(var k in filter){
      if(filter[k].count === req.body.testList.length) {           
        sub['full'].push(filter[k])
      } else {
        var arr1 = req.body.testList;
        var newFilterArr = filter[k].str.split(",")            
        var notFoundArr = arr1.diff(newFilterArr)
        console.log(notFoundArr)
        filter[k].notFound = notFoundArr;          
        sub['less'].push(filter[k])
      }
    }
    console.log(sub)
    res.send(sub)

  });

});

router.put("/user/test-search/laboratory/referral",function(req,res){
    if(req.user){
    var person = (req.body.phone && req.body.phone !== "") ? {phone: req.body.phone} : {user_id: req.user.user_id};
    model.user.findOne(person,{firstname:1,lastname:1,title:1,profile_pic_url:1,city:1,country:1,name:1,age:1,user_id:1})
    .exec(function(err,user){
      if(err) throw err;
        model.user.findOne({user_id: req.body.user_id},{
          diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1,presence:1,age:1,gender:1})
        .exec(function(err,result){
        var firstname = user.firstname || user.name;
        try{
        var refData = {
          firstname: firstname,
          lastname: user.lastname,
          title: user.title,
          address: user.address,
          city: user.city,
          country: user.country,
          phone: result.phone,
          id: user.user_id
        }

        var refObj = {
          ref_id: req.body.ref_id,
          referral_firstname: firstname,
          referral_lastname: user.lastname,
          referral_title: user.title,
          referral_id: user.user_id,    
          date: req.body.sent_date,            
          laboratory: {
            test_to_run : req.body.test_to_run,
            patient_firstname: user.firstname,
            patient_lastname: user.lastname,
            patient_profile_pic_url: user.profile_pic_url,
            patient_title: user.title,
            patient_phone: user.phone,
            session_id: req.body.session_id,
            patient_id: user.user_id,
            attended: false,
            age: user.age,
            gender: user.gender
          }             
        }

        var refNotification = {
          sender_firstname: firstname,
          sender_lastname: user.lastname,
          sender_title : user.title,
          sent_date: req.body.sent_date,
          ref_id: req.body.ref_id,
          note_id: req.body.ref_id,
          sender_profile_pic_url: user.profile_pic_url,
          message: "Please run the test for me"
        }

        if(result.presence === true){
          io.sockets.to(result.user_id).emit("notification",{status:true})
        } else {
          var msgBody = "You have new test request! Visit http://applinic.com/login"
          var phoneNunber = "234" + result.phone;
          sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

          }); //"2348096461927"
        }

        
        var refPos = result.referral.map(function(x){return x.ref_id}).indexOf(req.body.ref_id);

        if(refPos === -1){
          result.referral.push(refObj);
          //remember sms will be sent to the patient
          //this populates the patient medical record
          model.user.findOne({user_id: user.user_id},{medical_records: 1,user_id:1}).exec(function(err,record){
            if(err) throw err;     
            var recordObj = {
              test_to_run: req.body.test_to_run,
              center_address: req.body.address,
              center_city: req.body.city,
              center_country: req.body.country,
              center_name: req.body.name,
              center_phone: result.phone,
              center_id: req.body.id,
              patient_id: record.user_id,
              ref_id: req.body.ref_id,
              referral_firstname: firstname,
              referral_lastname: user.lastname,
              referral_title: user.title,
              sent_date: req.body.sent_date,
              session_id: req.body.session_id,
              report: "Pending",
              conclusion: "Pending"
            }
            record.medical_records.laboratory_test.unshift(recordObj);
            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              res.json({success:true,ref_id:req.body.ref_id});
            });

            result.diagnostic_center_notification.push(refNotification);
            result.save(function(err,info){
              if(err) throw err;          
            });
          });        
          
        } else {
           res.json({success:true,ref_id:req.body.ref_id});
        }  
        
    
        user.save(function(err,info){
          if(err) throw err;
          console.log("saved")
        })

       } catch(e){
          console.log(e.message)
        }

      })
   
      
    });

  } else {
    res.end("Unauthorized access")
  }
});

//for scan test search
router.put("/user/radiology/search/find-tests",function(req,res){
  
  if(req.user && req.body.city === undefined)
    req.body.city = req.user.city;
  model.services.find({type:"Radiology",center_city:req.body.city},
    {center_name:1,center_city:1,center_address:1,center_country:1,user_id:1,unavailable_services:1,_id:0},function(err,data){
    if(err) throw err;
    var newListToSend = [];        
    var sendObj = {};
    var listOfTests = req.body.testList;        
    for(var i = 0; i < listOfTests.length; i++){
      var elements = data.map(function(x){return x.unavailable_services});
      var count = 0;
      var foundTest = [];          
      while(count < elements.length){
        var centerInfo = {}                      
        var elementPos = elements[count].map(function(x){ return x.id}).indexOf(listOfTests[i].id);            
        centerInfo.notFound = listOfTests[i].name;
        if(elementPos === -1){              
          centerInfo.center_name = data[count].center_name;
          centerInfo.center_city = data[count].center_city;
          centerInfo.center_country = data[count].center_country;
          centerInfo.center_city = data[count].center_city;
          centerInfo.center_id = data[count].user_id;
          centerInfo.center_address = data[count].center_address;
          centerInfo.testFound = listOfTests[i].name;              
          foundTest.push(centerInfo)               
          sendObj[listOfTests[i].name] = foundTest;
          newListToSend.push(sendObj)  
        } 
        count++;
      }
    }
   
    var filter = {};
        
    for(var i in sendObj){
      for(var j = 0; j < sendObj[i].length; j++){
        if(!filter.hasOwnProperty(sendObj[i][j].center_id)){                             
          filter[sendObj[i][j].center_id] = {};
          filter[sendObj[i][j].center_id].count = 1;
          filter[sendObj[i][j].center_id].name = sendObj[i][j].center_name;
          filter[sendObj[i][j].center_id].address = sendObj[i][j].center_address;
          filter[sendObj[i][j].center_id].city = sendObj[i][j].center_city;
          filter[sendObj[i][j].center_id].country = sendObj[i][j].center_country
          filter[sendObj[i][j].center_id].id = sendObj[i][j].center_id
          filter[sendObj[i][j].center_id].str = sendObj[i][j].testFound;
        } else {
          filter[sendObj[i][j].center_id].str += "," + sendObj[i][j].testFound;
          filter[sendObj[i][j].center_id].count++;
        }
      }
    }
   

    Array.prototype.diff = function(arr2) {
      var ret = [];
      this.sort();
      arr2.sort();
      for(var i = 0; i < this.length; i += 1) {
          if(arr2.indexOf( this[i].name ) === -1){
              ret.push( this[i] );
          }
      }
      return ret;
    };

    var sub = {};
    sub['full'] = []
    sub['less'] = [];
    for(var k in filter){
      if(filter[k].count === req.body.testList.length) {           
        sub['full'].push(filter[k])
      } else {
        var arr1 = req.body.testList;
        var newFilterArr = filter[k].str.split(",")            
        var notFoundArr = arr1.diff(newFilterArr)
        console.log(notFoundArr)
        filter[k].notFound = notFoundArr;          
        sub['less'].push(filter[k])
      }
    }
    console.log(sub)
    res.send(sub)

  });

});

router.put("/user/scan-search/radiology/referral",function(req,res){
    if(req.user){
    var person = (req.body.phone && req.body.phone !== "") ? {phone: req.body.phone} : {user_id: req.user.user_id};
    model.user.findOne(person,{firstname:1,lastname:1,title:1,profile_pic_url:1,city:1,country:1,name:1,age:1,user_id:1})
    .exec(function(err,user){
      if(err) throw err;
        model.user.findOne({user_id: req.body.user_id},{
          diagnostic_center_notification:1,referral:1,address:1,name:1,city:1,country:1,phone:1,user_id:1,presence:1})
        .exec(function(err,result){         
        var firstname = user.firstname || user.name;
        var refData = {
          firstname: firstname,
          lastname: user.lastname,
          title: user.title,
          address: user.address,
          city: user.city,
          country: user.country,
          phone: result.phone,
          id: user.user_id
        }

        var refObj = {
          ref_id: req.body.ref_id,
          referral_firstname: firstname,
          referral_lastname: user.lastname,
          referral_title: user.title,
          referral_id: user.user_id,    
          date: req.body.sent_date,            
          radiology: {
            test_to_run : req.body.test_to_run,
            patient_firstname: user.firstname,
            patient_lastname: user.lastname,
            patient_profile_pic_url: user.profile_pic_url,
            patient_title: user.title,
            patient_phone: user.phone,
            session_id: req.body.session_id,
            patient_id: user.user_id,
            attended: false
          }             
        }

        var refNotification = {
          sender_firstname: firstname,
          sender_lastname: user.lastname,
          sender_title : user.title,
          sent_date: req.body.sent_date,
          ref_id: req.body.ref_id,
          note_id: req.body.ref_id,
          sender_profile_pic_url: user.profile_pic_url,
          message: "Please run the test for me"
        }

        if(result.presence === true){
          io.sockets.to(result.user_id).emit("notification",{status:true})
        } else {
          var msgBody = "You have new test request! Visit http://applinic.com/login"
          var phoneNunber = "234" + result.phone;
          sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

          }); //"2348096461927"
        }

        
        var refPos = result.referral.map(function(x){return x.ref_id}).indexOf(req.body.ref_id);

        if(refPos === -1){
          result.referral.push(refObj);
          //remember sms will be sent to the patient
          //this populates the patient medical record
          model.user.findOne({user_id: user.user_id},{medical_records: 1,user_id:1}).exec(function(err,record){
            if(err) throw err;     
            var recordObj = {
              test_to_run: req.body.test_to_run,
              center_address: req.body.address,
              center_city: req.body.city,
              center_country: req.body.country,
              center_name: req.body.name,
              center_phone: result.phone,
              center_id: req.body.id,
              patient_id: record.user_id,
              ref_id: req.body.ref_id,
              referral_firstname: firstname,
              referral_lastname: user.lastname,
              referral_title: user.title,
              sent_date: req.body.sent_date,
              session_id: req.body.session_id,
              report: "Pending",
              conclusion: "Pending"
            }
            record.medical_records.radiology_test.unshift(recordObj);
            record.save(function(err,info){
              if(err) {
                throw err;
                res.end('500: Internal server error')
              }
              res.json({success:true,ref_id:req.body.ref_id});
              console.log("send all went well")
            });

            result.diagnostic_center_notification.push(refNotification);
            result.save(function(err,info){
              if(err) throw err;
              console.log("i saved !!!!")            
            });
          });        
          
        } else {
           res.json({success:true,ref_id:req.body.ref_id});
        }        
    
        user.save(function(err,info){
          if(err) throw err;
          console.log("saved")
        })

      })
   
      
    });

  } else {
    res.end("Unauthorized access")
  }
});


router.post("/user/courier",function(req,res){
  res.send({status:true})
});

  

//log out route
router.get("/user/logout",function(req,res){
    if(req.user){
       model.user.findOne({user_id: req.user.user_id},{presence:1,firstname:1,set_presence:1}).exec(function(err,data){
        data.presence = false;
        data.set_presence.general = false;
        data.save(function(err,info){
          console.log("presence is offline");           
          completeAction()
        });
       }) 
      
    } else {      
      completeAction()
    }

    function completeAction(){
      console.log("finally i am logged out!!!")          
      req.logout();
      res.redirect('/');
    }
});

/***************For emergency profile *************/

router.get("/patient/EM/profile/:id",function(req,res){
  model.user.findOne({user_id: req.params.id},{_id:0},function(err,result){
    if(err) throw err;
    if(!result) {
      res.sendFile(path.join(__dirname + "/404.html"))
    } else {
      res.render("emergency-profile",{userInfo:result});
    }
  })
  
});

router.put("/patient/get-medical-record/em",function(req,res){ 
console.log(req.body)     
  model.user.findOne({user_id: req.body.patient_id},{medical_records: 1,medications:1},function(err,data){
    console.log(data.medical_records.laboratory_test)
    res.json({medical_records: data.medical_records,prescriptions: data.medications})
    //Note from model, medications holds all prescriptions while medical_records holds all laboratory and radiology tests
    // though there is prescription property on medical_record obj but not used yet.
  });   

});

router.put("/patient/get-prescription/track-record/em",function(req,res){
  model.user.findOne({user_id:req.body.patient_id},{prescription_tracking:1,_id:0},function(err,data){
    console.log(data.prescription_tracking);
    res.send(data.prescription_tracking);
  });
});

/********** All delete route *******/

router.delete("/patient/delete-one",function(req,res){
  var projection = {};
  projection[req.body.dest] = 1;
  var del = new deleteItem(req.body.item,req.user.user_id);
  del.DeleteByUserId(model,projection);
  res.send("deleted");
});


router.delete("/patient/delete-one/appointment",function(req,res){
  var projection = {};
  projection[req.body.dest] = 1;
  var del = new deleteItem(req.body.item,req.user.user_id);
  del.DeleteBySessionId(model,projection);
  res.send("deleted");
});


router.delete("/patient/delete-many",function(req,res){
  console.log(req.body);
  var projection = {};
  projection[req.body.dest] = 1;
  var del = new deleteItem(req.body.item,req.user.user_id);
  del.DeleteAll(model,projection);
  res.send("deleted");
});

router.delete("/user/delete-all-chat",function(req,res){
  var projection = {};
  projection[req.body.dest] = 1;
  var del = new deleteItem(req.body.item);
  del.deleteAllChat(model,projection);
  res.send("deleted");
});


/************ patient waiting room ************/

router.get("/user/patients/waiting-room",function(req,res){
  if(req.user.type === "Doctor"){
    res.render("patient-waiting-room")
  } else {
    res.send('Opps! You are note allowed to view this page')
  }
  
});

router.get("/user/response/patients-histories/:batch",function(req,res){
  var limit;
  var index;
  switch(req.params.batch){
    case "1":
      limit = 20;
      index = 0;
    break;
    case "2":
      limit = 40;
      index = 20;
    break;
    case "3":
      limit = 60;
      index = 40;
    break;
    case "4":
      limit = 80;
      index = 60;
    break;
    case "5":
      limit = 100;
      index = 80;
    break;
    case "6":
      limit = 120;
      index = 100;
    break;
    case "7":
      limit = 140;
      index = 120;
    break;
    case "8":
      limit = 160;
      index = 140;
    break;
    case "9":
      limit = 180;
      index = 160;
    break;
    case "10":
      limit = 300; //note this should be 200. ie intervals of 20. will be modified later.
      index = 180;
    break;
    default:
    break;
  }
  model.help.find({},function(err,data){
    if(err) throw err;
    var len = data.length;
    var selected = data.slice(index,len);
    res.send(selected);
    
  }).limit(limit);
});

router.post("/user/response/patients-histories",function(req,res){
  if(req.user && req.user.type === "Doctor"){
    model.user.findOne({user_id: req.user.user_id},{firstname:1,profile_pic_url:1,user_id:1,specialty:1,profile_url:1},function(err,data){
      if(err) throw err;
      model.help.findOne({complaint_id: req.body.complaint_id,patient_id:req.body.patient_id},{response:1}).exec(function(err,found){
        req.body.doctor_name = data.firstname;
        req.body.doctor_profile_pic_url = data.profile_pic_url;
        req.body.doctor_profile_url = data.profile_url;
        req.body.doctor_specialty = data.specialty;
        req.body.doctor_user_id = data.user_id;
        var elemPos = found.response.map(function(x){return x.doctor_user_id}).indexOf(data.user_id);
        if(elemPos === -1){          
          model.user.findOne({user_id:req.body.patient_id},
            {patient_mail:1,accepted_doctors:1,firstname:1,lastname:1,user_id:1,phone:1,presence:1}).exec(function(err,patient){           
            if(err) throw err;
            var checkIsMyDoctor = patient.accepted_doctors.map(function(x){return x.doctor_id}).indexOf(data.user_id);
            
            if(checkIsMyDoctor === -1){              
              found.response.push(req.body);
              var date = + new Date();
              var msg = "(" + found.response.length + ") Doctors" + " has responded to your complain.";
              var checkComplain = patient.patient_mail.map(function(x){return x.complaint_id}).indexOf(req.body.complaint_id);
              if(checkComplain !== -1){
                var complain = patient.patient_mail[checkComplain];
                complain.message = msg;
              } else {
                msg = "1 Doctor has responded for the complain ";
                patient.patient_mail.push({
                  category: "need_doctor",
                  date: date,
                  user_id: data.user_id,
                  complaint_id: req.body.complaint_id,
                  message: msg,
                  profile_pic_url: data.profile_pic_url
                });                
              }

              if(patient.presence === true){
                io.sockets.to(patient.user_id).emit("message notification",{status:true})
              } else {
                var msgBody = "A Doctor responded to your history! Visit http://applinic.com/login"
                var phoneNunber = "234" + patient.phone;
                sms.message.sendSms('Applinic',phoneNunber,msgBody,function(err,responseData){

                }); //"2348096461927"
              }
            } else {
              patient.save(function(err,info){})
              var info = "Oops!! The request was not submited.Reason: This history is from your patient.\nPlease contact " + 
              patient.firstname + " " + patient.lastname;
            }
            patient.save(function(err,info){});
            var message = info || "Patient notified";
            res.send({message: message}); 
            found.save(function(err,info){
              console.log("saved successfully");          
            });
          });
          
        } else {
          res.send({error: "You have already responded to this history"});

        }

      });
    });
  } else {
    res.send({error: "Unauthorized access!!!. You are not a doctor."});
  }
});

router.get("/user/patient/get-response",function(req,res){
  if(req.user && req.user.type === "Patient"){
    model.help.findOne({complaint_id: req.query.complaintId},function(err,complain){
      if(err) throw err;
      res.send(complain);
    });
  } else {
    res.send("Unauthorized access!");
  }
})

router.get("/user/get-person-profile/:personId",function(req,res){
  if(req.user){
    model.user.findOne({user_id: req.params.personId},function(err,data){
      if(err) throw err;
      res.send(data);
    })
  } else {
    res.send("Unauthorized access!")
  }
});

router.get("/user/patient/get-my-doctors",function(req,res){
  if(req.user) {   
    model.user.find({"doctor_patients_list.patient_id": req.user.user_id,type:"Doctor"},
      {
        user_id:1,
        firstname:1,
        lastname:1,
        profile_pic_url:1,
        specialty:1,
        office_hour:1,
        _id:0,
        presence:1

    },function(err,data){
      if(err) throw err;
      var sendList = [];
      var dataLen = data.length;
      var count = 0;
      model.user.findOne({user_id:req.user.user_id},{accepted_doctors:1},function(err,list){
        while(dataLen > count){
          var elementPos = list.accepted_doctors.map(function(x){return x.doctor_id}).indexOf(data[count].user_id)
            // service_access is used to check duration of consultation fees
            //if consultation has lasted beyond certian period service access will be set to false from the admin therefore patient will not see 
            //the doctor in his dashboard.
            if(data[count].presence === true){             
              list.accepted_doctors[elementPos].presence = true;
              sendList.push(list.accepted_doctors[elementPos]);
            } else {
              sendList.push(list.accepted_doctors[elementPos]);
            }
          
          count++
        }       
        res.send(sendList);
      });      
    });
  } else {
    res.send("Unauthorized access!")
  }
});
/***************  will be modified as above ************/
 //this route get all the doctor's patients to include which patient is online or not.
 router.get("/user/doctor/my-online-patients",function(req,res){
    if(req.user){
      model.user.find({"accepted_doctors.doctor_id":req.user.user_id,type:"Patient"},
        {user_id:1,_id:0,firstname:1,lastname:1,presence:1,profile_pic_url:1},function(err,data){
        if(err) throw err;
        var sendList = [];
        var dataLen = data.length;
        var count = 0;
        model.user.findOne({user_id:req.user.user_id},{doctor_patients_list:1},function(err,list){
          while(dataLen > count){
            var elementPos = list.doctor_patients_list.map(function(x){return x.patient_id}).indexOf(data[count].user_id)
              
              if(data[count].presence === true){             
                list.doctor_patients_list[elementPos].presence = true;
                sendList.push(list.doctor_patients_list[elementPos]);
              } 
            
            count++
          } 
          res.send(sendList);
        });
      })
    } else {
      res.end("Unauthorized access!!")
    }
  }); 

  //this route gets all doctors accepted patient. just for other ourposes wihich may no include whether use is presence or not at first.

  router.get("/user/doctor/my-patients",function(req,res){
    if(req.user){
      model.user.findOne({"accepted_doctors.doctor_id":req.user.user_id},{doctor_patients_list:1,_id:0},function(err,data){
        if(err) throw err;
        res.send(data);
      });
    } else {
      res.end("Unauthorized access!!")
    }
  });

//this route gets all patients accepted doctors. just for other ourposes wihich may no include whether use is presence or not at first.
  router.get("/user/patient/my-doctors",function(req,res){
    if(req.user){
      model.user.findOne({email: req.user.email},{accepted_doctors:1,_id:0},function(err,data){
        if(err) throw err;
        res.send(data);
      });
    } else {
      res.end("Unauthorized access!!!");
    }
  });

 

/*
{ doctor_id: '161792665',
  date_of_acceptance: '1493908992172',
  doctor_firstname: 'Ani',
  doctor_lastname: 'Emeka',
  doctor_profile_pic_url: '/download/profile_pic/39e81110c0ed5fb9acefbd2402734
b',
  service_access: 'true',
  doctor_specialty: 'Aerospace Medicine',
  _id: 590b3e1707b36d582b4340ab,
  office_hour: [] },
*/

/** this route gets all the request sent by patient for a doctor. The response is an object with properties like
doctor_notification, doctor_prescriptionRequest,doctor_mail,inPerson_appointment, chat_request,video_call_request,audio_call_request.
this route will be called with set time interval to update the doctor's dashboard of any request sent buy a patient.***/
router.get("/user/doctor/:userId/get-all-request",function(req,res){
 
  if(req.user){
    model.user.findOne({user_id: req.params.userId},{doctor_notification:1,_id:0,doctor_prescriptionRequest:1},function(err,data){
      if(err) throw err;
      res.send(data);
    })
  } else {
    res.send("Unauthorized access!")
  }
});

//this route adds user to the array of converstion presence
/*router.put("/user/conversation-availability",function(req,res){
 if(req.user){
  
   model.communication.findOne({},{ongoing_conversation:1}).exec(function(err,data){
    if(err) throw err;

    if(!data) {
      var conversation = new model.communication({
        ongoing_conversation: []
      });

      conversation.ongoing_conversation.push({
        timeStamp: req.body.time,
        user_id:req.body.userId
      });

      conversation.save(function(err,info){
        console.log("saved");
      });

     } else {      
      var checkPresence = data.ongoing_conversation.map(function(x){return x.user_id}).indexOf(req.body.userId);
      if(checkPresence === -1) {
        data.ongoing_conversation.push({
          timeStamp: req.body.time,
          userId:req.body.userId
        });
        
      } 

      data.save(function(err,info){
        console.log("saved")
        res.send({status: "joined"});
      });
      
     }
     
   });

 } else {
  res.send("Unauthorized access!!!");
 }
});*/


//this route checks to see if doctor is logged in or in conversation array before any communication session is established.
router.get("/user/:id/communication-request",function(req,res){
  if(req.user){
  
    model.user.findOne({user_id: req.params.id},{presence:1,_id:0},function(err,user){
      if(err) throw err;
      
      res.send(user);
    });    
  } else {
    res.send("Unauthorized access");
  }
});

//this route actually saves the patient object to the doctors_notification
//note req.param.id refers to the id of the doctor in this case who the patient wish to communicate to.
router.post("/user/:id/communication-request",function(req,res){
  if(req.user){

    model.communication.findOne({},{ongoing_conversation:1},function(err,conversation){
      if(err) throw err;    
      var checkUser = conversation.ongoing_conversation.map(function(x){return x.userId}).indexOf(req.params.id);
      
      model.user.findOne({user_id: req.params.id},{presence:1,doctor_notification:1,watch_list:1,lastname:1}).exec(function(err,user){
        if(err) throw err;
        if(checkUser === -1) {
          user.doctor_notification.unshift(req.body);
          var url = "/user/get-response/" + req.body.sender_id;     
          res.send({checkUrl: url,free:trues});
        } else {
          console.log("see user");
          console.log(user);
          user.watch_list.push({
            sender_firstname: req.body.sender_firstname,
            sender_lastname: req.body.sender_lastname,
            sender_profile_pic_url: req.body.sender_profile_pic_url,
            sender_id: req.body.sender_id
          });
          var url = "/user/get-response/" + req.body.sender_id;     
          var resMsg = user.lastname + " is currently attending to a patient. You have joined the queue."
          res.send({status: "Busy",message: resMsg,checkUrl: url});
        }
        user.save(function(err,info){
          if(err) throw err;
          console.log("saved")
        });    
      });
      
    });
  } else {
    res.send("Unauthorized access");
  }
});

//this route gets the response to the response
//@params id refers to the id of the initiator of request
router.get("/user/user/get-response/:id",function(req,res){ 
  if(req.user){
    
    emitter.on(req.params.id,function(data){
      res.send(data);
    });
    //res.send({obi: "save me"})
  } else {
    res.send("Unauthorized access!!!");
  }
});

//this route takes care of doctors response whether to conversate with patient by a giving time.
//@ id refers to the id of the initiator of request. just thesame with emitter.on method id above
router.put("/user/feedback",function(req,res){
  if(req.user){
    emitter.emit(req.body.id,req.body);
    //res.send({success: true});
  } else {
    res.send("Unauthorized access!!!");
  }
});

//this route sets user presence to be online or offline
//Note by default presence is set to true ie online whenever user logs in.
router.put("/user/set-presence",function(req,res){
  if(req.user){
    model.user.findOne({user_id: req.user.user_id},{presence:1}).exec(function(err,data){
      if(err) throw err;
      switch(req.query.status){
        case "Busy":
          data.presence = false;
        break;
        case "offline":
          data.presence = false;
        break;
        case "online":
          data.presence = true;
        break
        default:
        break;
      }
      data.save(function(err,info){
        console.log("presence saved.")
      });
    });    
  } else {
    res.send("Unauthorized access")
  }
});

// for admin
router.get('/user/getAllPatients',function(req,res){
  if(req.user){
    model.user.find({type:"Patient"},function(err,data){
      res.send({count:data.length});
    })
  } else {
    res.redirect("/login")
  }
});

router.get('/user/getAllDoctor',function(req,res){
  if(req.user){
    model.user.find({type:"Doctor"},function(err,data){
      res.send({count:data.length});
    })
  } else {
    res.redirect("/login")
  }
});

router.get('/user/getAllPharmarcy',function(req,res){
  if(req.user){
    model.user.find({type:"Pharmacy"},function(err,data){
      res.send({count:data.length});
    })
  } else {
    res.redirect("/login")
  }
});

router.get('/user/getAllLaboratory',function(req,res){
  if(req.user){
    model.user.find({type:"Laboratory"},function(err,data){
      res.send({count:data.length});
    })
  } else {
    res.redirect("/login")
  }
});

router.get('/user/getAllRadiology',function(req,res){
  if(req.user){
    model.user.find({type:"Radiology"},function(err,data){
      res.send({count:data.length});
    })
  } else {
    res.redirect("/login")
  }
});

}

module.exports = basicRoute;
/*console.log(req.body);
            console.log(req.files);
            var ima = req.files[0].path;
            var readable = fs.createReadStream(__dirname + "/" + ima);
          var writable = fs.createWriteStream(__dirname + '/public/images/dashboard/profile.jpg');
            readable.on('data',function(chunk){ 
            writable.write(chunk);
          });

            ///uploaded no image file just for it to be in the server.
            
            var no_profile_pic = new model.files({
                filename: req.files[0].filename,
                path: req.files[0].path,
                file_id: "nopic"
            });

            no_profile_pic.save(function(err){
                if(err) throw err;
                console.log("file saved");
            })*/
