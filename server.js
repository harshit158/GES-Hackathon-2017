var express = require('express');
var	app = express();
const firebase= require('firebase');

app.set('port', (process.env.PORT || 3000))


// Initializing firebase -----------------------

var config = {
  apiKey: "AIzaSyCUcgbm-0Yfhv1YF1UREO7iy8zZdoSNl5s",
  authDomain: " fetchfind-12fc9.firebaseapp.com",
  databaseURL: "https://fetchfind-12fc9.firebaseio.com",
};

firebase.initializeApp(config);
var db = firebase.database()

// Routes ---------------------------------------
// Checking the server
app.get('/', function(req, res) {
	res.send("Welcome to Fetchfind");
});

// Getting the length of any node
app.get('/getLength/:addressForLength', function(req, res) {
	var address = addressForLength;
	res.send('dlfkldfd');
	// db.ref(address).once('value',function(snap){
	// 	var jsonObject = snap.val();
	// 	var count=0;
	// 	for (var user in jsonObject){
	// 		count++;
	// 	}
	// 	res.send('Total Number: '+count);
	// });
	
		
});

// Only for Users node
app.get('/Users/:userId', function(req, res) {
	var userid=req.params.userId;
	db.ref('Users/'+userid).set({Lost:'' ,Found:''});
});

// start the server
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
})