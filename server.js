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

var cronJob = require('cron').CronJob;

var job = new cronJob({
	cronTime: '00 00 24 * * *',
	onTick: function() {
		var curr = new Date(new Date().getMilliseconds()-8.64*10000000)
		var date = curr.getFullYear()+"-"+(curr.getMonth()+1)+"-"+curr.getDate()
		ref.child('debriefings/'+date.substring(5)).set({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		guardian.content({
	  		q : 'sports',
	  		fromDate : date
		}).then(function(response){
	  		response.results.forEach(function(e){
	  			ref.child('debriefings/'+date.substring(5)+'/sports').push({
	  				title: e.webTitle
	  			});
	  		});
		}, function(err){
			console.log(err);
		});
	},
	start: false,
	timeZone: "America/Los_Angeles"
});

job.start();