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
		console.log("Starting")
		var curr = new Date(Date.now()-86400000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		ref.child('debriefings/'+date).set({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		topics = ['sports', 'politics', 'money','technology']
		topics.forEach(function(topic){
			guardian.content({
		  		q : topic,
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
								// console.log(date);
								ref.child('debriefings/'+date+'/'+topic).push({
		  							title: e.webTitle,
		  							url: e.webUrl,
		  							shortsum: response2.sentences.join(' '),
		  							longsum: response1.sentences.join(' ')
		  						});
							}
							else {
								console.log("There was an error with aylien")
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
	timeZone: "America/New_York"
});

job.start();

var job2 = new cronJob({
	cronTime: '00 05 00 * * *',
	onTick: function() {
		console.log("Starting")
		var curr = new Date(Date.now()-86400000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		ref.child('debriefings/'+date).set({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		topics = ['entertainment','science','music','movies' ]
		topics.forEach(function(topic){
			guardian.content({
		  		q : topic,
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
								// console.log(date);
								ref.child('debriefings/'+date+'/'+topic).push({
		  							title: e.webTitle,
		  							url: e.webUrl,
		  							shortsum: response2.sentences.join(' '),
		  							longsum: response1.sentences.join(' ')
		  						});
							}
							else {
								console.log("There was an error with aylien")
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
	timeZone: "America/New_York"
});

job2.start();

var stayjob = new cronJob({
	cronTime: '00 00,20,40 * * * *',
	onTick: function() {
		console.log("still running")
		var x = 4
		x = x*5
		x = x%3
	},
	start: false,
	timeZone: "America/New_York"
});

stayjob.start();

var http = require('http');

http.createServer(function (request, response) {
	console.log("SERVER CREATED")
}).listen(process.env.PORT || 5000);

setInterval(function(){
	http.get("https://guarded-woodland-24025.herokuapp.com/");
}, 1000*3600*5);