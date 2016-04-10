'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var session = require('express-session');
var mongoClient = require('mongodb').MongoClient;

var app = express();
require('dotenv').load();

var mongoDevUri = 'mongodb://localhost:27017/clementinejs';

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

routes(app);

app.get('/[0-9]+', function(req, res) {
	var publicId = req.url.substr(1);
	if (isNaN(publicId)) {
		return res.end(JSON.stringify({
			"error": "Invalid short URL given."
		}));
	}
	mongoClient.connect(process.env.MONGO_URI || mongoDevUri, function(err, db) {
		if (err) {
			throw err;
		}
		
		db.collection('urls').find({
			public_id: { $eq: +publicId }
		}, {
			_id: false,
			original_url: true,
		}).toArray(function(err, docs) {
			if (err) {
				return res.end(JSON.stringify({
					"error": "Could not find the url."
				}));
			}
			db.close();
			res.redirect(docs[0].original_url);
			return res.end();
		});
	});
});

app.get(/new\/(https?:\/\/.*)/, function(req, res) {
	var obj = {
		"original_url": req.params[0]
	};
	
	mongoClient.connect(process.env.MONGO_URI || mongoDevUri, function(err, db) {
		if (err) {
			throw err;
		}
		
		var urlCollection = db.collection('urls');
		urlCollection.count({}, function(err, count) {
			if (err) {
				throw err;
			}
			obj['short_url'] = process.env.APP_URL + count;
			obj['public_id'] = count;
			
			urlCollection.insert(obj, function(err, data) {
				if(err) {
					throw err;
				}
				db.close();
				delete obj['_id'];
				delete obj['public_id'];
				return res.end(JSON.stringify(obj));
			});
		});
	});
});

// Reject invalid url
app.get('/new/:token', function(req, res) {
	return res.end(JSON.stringify({
		"error": "Invalid url: " + req.params.token
	}));
})

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});