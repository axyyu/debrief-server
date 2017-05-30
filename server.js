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
	cronTime: '00 00 24 * * *',
	onTick: function() {
		var curr = new Date(new Date().getMilliseconds()-86400000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		ref.child('debriefings/'+date.substring(5)).set({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		topics = ['sports', 'politics']
		topics.forEach(function(topic){
			guardian.content({
		  		q : topic,
		  		fromDate : date,
		  		pagesize : 5,
		  		pages : 1
			}).then(function(response){
		  		response.results.forEach(function(e){
		  			textapi.summarize({
						url: e.webUrl,
						sentences_number: 6
					}, function(error1, response1) {
						textapi.summarize({
							url: e.webUrl,
							sentences_number: 2
						}, function(error2, response2) {
							if (error2 === null && error1 === null) {
								ref.child('debriefings/'+date.substring(5)+'/'+topic).push({
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
	timeZone: "America/Los_Angeles"
});

job.start();