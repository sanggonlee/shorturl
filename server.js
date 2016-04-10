'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
//var mongoose = require('mongoose');
var session = require('express-session');
var mongoClient = require('mongodb').MongoClient;

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

app.get('/new/:url', function(req, res) {
	var inputUrl = req.params.url;
	var obj = {
		"original_url": inputUrl
	};
	console.log("in: "+JSON.stringify(obj));
	
	mongoClient.connect(process.env.MONGO_URI || mongoDevUri, function(err, db) {
		db.collection('urls').insert(obj, function(err, data) {
			if(err) {
				throw err;
			}
			console.log(JSON.stringify(data));
			obj.short_url = process.env.APP_URL + data.insertedCount;
		});
	});
	return res.end(JSON.stringify(obj));
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});