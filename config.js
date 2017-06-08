'use strict';
require('dotenv').config();
var express = require('express');
var path = require("path");
var multer = require('multer');
var bodyParser = require('body-parser');
var router = express.Router();
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require("cookie-parser");


var configuration = function (app,model) {
	//config
	
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
	
	//middleware
	app.use(cookieParser());
	app.use(session({
	  secret: 'keyboard cat',
	  resave: true,	  
	  saveUninitialized: true,
	  cookie: { maxAge: 36000000 }
	}));
	
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());		
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(multer({dest: './uploads'}).any());	
	app.use('/',router);	
	app.use('/assets',express.static(__dirname + '/public'));
	
	
	passport.serializeUser(function(user, done) {    
      done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		model.user.findById(id, function(err, user) {
			done(err, user);
		});
	});

}

module.exports = {
  configuration: configuration,
  router: router	
}