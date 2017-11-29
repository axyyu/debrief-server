var firebase = require("firebase-admin");
firebase.initializeApp({
  credential: firebase.credential.cert("debrief-key.json"),
  databaseURL: "https://debrief-d5edb.firebaseio.com/"
});
var ref = firebase.database().ref('/');

var guardian = require('guardian-news');
guardian.config({
  apiKey : '3edb905c-3045-4235-91f6-e7d64b878dad'
});

var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "789afd83",
  application_key: "4ad2f7c200a8f44301954c63567eb743"
});

var cronJob = require('cron').CronJob;

var job = new cronJob({
	cronTime: '00 00 00 * * *',
	onTick: function() {
		var curr = new Date(Date.now()-86400000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		ref.child('debriefings/'+date.substring(5)).set({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		topics = [{name: 'sports', tag: 'sport'}, {name: 'politics', tag: 'politics'}, {name: 'technology', tag: 'technology'}, {name: 'science', tag: 'science'}, {name: 'world', tag: 'world'}]
		topics.forEach(function(topic){
			guardian.content({
		  		section : topic.tag,
		  		fromDate : date,
		  		pageSize : 5,
		  		pages : 1
			}).then(function(response){
		  		response.response.results.forEach(function(e){
		  			textapi.summarize({
						url: e.webUrl,
						sentences_number: 6
					}, function(error1, response1) {
						textapi.summarize({
							url: e.webUrl,
							sentences_number: 1
						}, function(error2, response2) {
							if (error2 === null && error1 === null) {
								ref.child('debriefings/'+date.substring(5)+'/'+topic.name).push({
		  							title: e.webTitle,
		  							url: e.webUrl,
		  							shortsum: response2.sentences.join(' '),
		  							longsum: response1.sentences.join(' ')
		  						});
							}
							else {
								console.log("There was an error with aylien "+error1+" "+error2)
							}
						});
					});
		  		});
			}, function(err){
				console.log(err);
			});
		})
	},
	start: false,
	timeZone: "America/Los_Angeles"
});

job.start();

var job2 = new cronJob({
	cronTime: '02 00 00 * * *',
	onTick: function() {
		var curr = new Date(Date.now()-86400000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		topics = [{name: 'money', tag: 'money'}, {name: 'entertainment', tag: 'tv-and-radio'}, {name: 'movies', tag: 'film'}, {name: 'music', tag: 'music'}]
		topics.forEach(function(topic){
			guardian.content({
		  		section : topic.tag,
		  		fromDate : date,
		  		pageSize : 5,
		  		pages : 1
			}).then(function(response){
		  		response.response.results.forEach(function(e){
		  			textapi.summarize({
						url: e.webUrl,
						sentences_number: 6
					}, function(error1, response1) {
						textapi.summarize({
							url: e.webUrl,
							sentences_number: 2
						}, function(error2, response2) {
							if (error2 === null && error1 === null) {
								ref.child('debriefings/'+date.substring(5)+'/'+topic.name).push({
		  							title: e.webTitle,
		  							url: e.webUrl,
		  							shortsum: response2.sentences.join(' '),
		  							longsum: response1.sentences.join(' ')
		  						});
							}
							else {
								console.log("There was an error with aylien "+error1+" "+error2)
							}
						});
					});
		  		});
			}, function(err){
				console.log(err);
			});
		})
	},
	start: false,
	timeZone: "America/Los_Angeles"
});

job2.start();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

app.use('/', router);

router.get('/', function(req, res){
	res.json({message: "Welcome to my API"})
});

app.listen(port);
console.log('Magic happens on port ' + port);

var http = require("http");
setInterval(function() {
    http.get("http://debriefserver.herokuapp.com");
}, 300000);