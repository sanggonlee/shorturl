'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
//var mongoose = require('mongoose');
var session = require('express-session');

var app = express();
require('dotenv').load();

var mongoDevUri = 'mongodb://localhost:27017/clementinejs';
//mongoose.connect(process.env.MONGO_URI || mongoDevUri);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

routes(app);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});