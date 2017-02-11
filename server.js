var express = require('express');
var	app = express();
const firebase= require('firebase');

app.set('port', (process.env.PORT || 3000))


// Initializing firebase 
var config = {
  apiKey: "AIzaSyCUcgbm-0Yfhv1YF1UREO7iy8zZdoSNl5s",
  authDomain: " fetchfind-12fc9.firebaseapp.com",
  databaseURL: "https://fetchfind-12fc9.firebaseio.com",
};

firebase.initializeApp(config);
var db = firebase.database()

// db.ref('Users/User 4').set({Lost:'Harshit Sharma',Found:'Sindhra'})

// BASE ROUTES 

app.get('/', function(req, res) {
	res.send("Welcome to Fetchfind");
});

app.get('/getdata', function(req, res) {
	db.ref('/Users').once('value',function(snap){
		res.send(snap.val());
	});
});

app.get('/Users/:userId', function(req, res) {
	var userid=req.params.userId;
	db.ref('Users/'+userid).set({Lost:'Key' ,Found:'Wallet'});
});

// start the server
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
})