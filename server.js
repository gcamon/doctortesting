"use strict";
var express = require('express'),      
  db = require('./model'),
  config = require('./config'),    
  route = require('./route'),
  signupRoute = require('./signup'),
  loginRoute = require('./login'),  
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  model = db(),
  payments = require("./finance"),
  Nexmo = require("nexmo"),    
  sms = new Nexmo({
  	apiKey: process.env.NEXMO_API_KEY || "1c9ae030",
		apiSecret: process.env.NEXMO_API_SECRET || "ddb306aa9194c137"
  }), 
  placement = require("./placement"),
  mySocket = require("./socket"),
  port = process.env.PORT || 8080;
  
  var ExpressPeerServer = require('peer').ExpressPeerServer;

    
var options = {
  debug: true
}

app.use('/call',ExpressPeerServer(http,options));


http.listen(port,function(){
    console.log('listening on *:8080');
});




config.configuration(app,model)
signupRoute(model,sms);
loginRoute(model);
route(model,sms,io); 
payments(model,sms,io);
placement(model,sms);
mySocket(model,io)



