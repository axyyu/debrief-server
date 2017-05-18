var firebase = require("firebase-admin");
firebase.initializeApp({
  credential: firebase.credential.cert("debrief-key.json"),
  databaseURL: "https://debrief-e5edb.firebaseio.com/"
});