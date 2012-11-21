/*
 *
 * Init
 *
 */

var CONFIG = require('./config');

//Create Express
var express = require('express');
var app = express();

//Twitter
var twitter = require('ntwitter');
var twit = new twitter(CONFIG.twitter);

//Bitly
var Bitly = require('bitly');
var bitly = new Bitly(CONFIG.bitly.username, CONFIG.bitly.key);

//Create mongodb link
var mongoose = require('mongoose');
mongoose.connect(CONFIG.mongoURL);

//When running localy use the non builded folder
if(!process.env.NODE_ENV || process.env.NODE_ENV != 'production') {
	var publicFolder = __dirname + "/app";

//When running nodejitsu use builded folder
} else {
	var publicFolder = __dirname + "/dist";
}

//Template engine
var consolidate = require('consolidate');
app.engine('html', consolidate.swig);
app.set('view engine', 'html');
app.set('views', publicFolder);


//Configure express
app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(publicFolder));
});
app.enable("jsonp callback");
app.listen(CONFIG.port);


/*
 *
 * Models
 *
 */

//Models list
var MODELS = {
	'item' : {
		'api' : {

		}
	}
};

//Build models from schema
for(var modelName in MODELS) {
	var schema = require('./schemas/'+modelName);
	var model = mongoose.model(modelName, schema);
	MODELS[modelName].schema = schema;
	MODELS[modelName].model = model;
}

/*
 *
 * Api
 *
 */

//Send JSON response
function sendResponse(res,err,data)  {
	var response = {
		'success' : true
	}
	if (err) {
		response.success = false;
		response.error = {
			'message' : err.message,
			'errors' : err.errors
		};
	} else {
		response.data = data;
	}
	return res.jsonp(response);
}

//Init models api
for(var key in MODELS) {

	var currentModel = MODELS[key];

	if(typeof(currentModel.api) == 'undefined') continue;

	//List
	if(typeof(currentModel.api.list) == 'undefined' || currentModel.api.list) {
		app.get('/api/'+key+'/list', function(Model) {

			var opts = Model.api.list || {};

			return function (req, res){

				//Build query
				var query = Model.model.find(req.query);

				//Execute query
				return query.exec(function (err, data) {
					return sendResponse(res,err,data);
				});

			}

		}(currentModel));
	}

	//Next
	if(typeof(currentModel.api.next) == 'undefined' || currentModel.api.next) {
		app.get('/api/'+key+'/((next|previous))', function(Model) {

			return function (req, res){

				var next = req.params[0] == 'next' ? true:false;

				var params = {};

				//Build query
				if(typeof(req.query.id) != 'undefined') {
					if(next) {
						params['_id'] = {
							$lt: req.query.id
						};
					} else {
						params['_id'] = {
							$gt: req.query.id
						};
					}
				}
				var query = Model.model.find(params);
				if(next) query.sort('-_id');
				else query.sort('_id');
				query.limit(1);

				//Execute query
				return query.exec(function (err, data) {
					return sendResponse(res,err,data.length ? data[0]:null);
				});

			}

		}(currentModel));
	}

	//Create
	if(typeof(currentModel.api.create) == 'undefined' || currentModel.api.create) {
		app.get('/api/'+key+'/create', function(Model) {

			return function (req, res){

				var newItem = new Model.model(req.query);
				return newItem.save(function(err,data) {
					if (!err && data && data.text && data.text.length) {
						try {
							bitly.shorten('http://chier.ca/'+data._id, function(err, response) {
								if (err) return;
								twit.updateStatus(data.text+' '+response.data.url,function (err, data) {
									
								});
							});
						} catch(e) {}
						
					}
					return sendResponse(res,err,data);

				});

			}

		}(currentModel));
	}

}

//Home
app.get('/',function(req,res) {
	res.render('index');
});


//Display all
app.get('/tout',function(req,res) {

	var query = MODELS['item'].model.find();
	query.sort('-_id');

	//Execute query
	return query.exec(function (err, data) {
		res.render('all',{
			'slides' : data
		});
	});

	
});

//Display one specific quote
app.get('/(([^\.]+))',function(req,res) {

	var id = req.params[0];

	var query = MODELS['item'].model.findById(id);

	//Execute query
	return query.exec(function (err, data) {
		res.render('index',{
			'slide' : JSON.stringify(data),
			'id' : data ? data._id:null,
			'text' : data ? data.text:null
		});
	});

	
});