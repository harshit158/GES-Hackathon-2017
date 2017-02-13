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

firebase.database.enableLogging(true);
firebase.initializeApp(config);
var db = firebase.database()

// Routes ---------------------------------------
// Checking the server
app.get('/', function(req, res) {
	res.send("Welcome to Fetchfind");
});

// Getting the length of any node
app.get('/getLength/:addressForLength', function(req, res) {
	var address = req.params.addressForLength;
	address=address.split('+');
	address=address.join('/')
	db.ref(address).once('value',function(snap){
		var jsonObject = snap.val();
		var count=0;
		for (var user in jsonObject){
			count++;
		}
		// res.setHeader('Content-Type', 'application/json');
		res.send({'Total number: ':count});
	});	
});

// Adding new user to database
app.get('/Users/:userId', function(req, res) {
	var userid = req.params.userId.split('+')[0];
	var userName = req.params.userId.split('+')[1];
	db.ref('Users/'+userid).update({Name:userName});
});

// Updating the Items
app.get('/updateItems/:Itemdata', function(req, res) {
	var item = req.params.Itemdata.split('+')[0];
	var foundOrlost = req.params.Itemdata.split('+')[1];
	var data = JSON.parse(req.params.Itemdata.split('+')[2]);

	//Pushing to individual items node
	var newPostKey=db.ref(item+'/'+ foundOrlost).push().key;
	var userid=data['userid'];
	var updates={};

	updates[item+'/'+ foundOrlost +'/'+newPostKey]=data;
	updates['Users/'+userid]={foundOrlost:newPostKey};

	db.ref().update(updates);

	// db.ref(item+'/'+ foundOrlost).push(JSON.parse(data));

	//Adding id of items to corresponding users
	
	// db.ref('Users/'+userid).update({foundOrlost:newPostKey});
});


// Searching if a user has already submitted any preivious request
app.get('/Users/search/:userId', function(req, res) {
	var userToSearch=req.params.userId;
	db.ref('Users/').once('value',function(snap){
		var jsonObject = snap.val();
		if(jsonObject.hasOwnProperty(userToSearch)){
			res.send("yes");
		}		
		else res.send("no");
	});	
});


// start the server
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
})