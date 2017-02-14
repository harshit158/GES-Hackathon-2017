var express = require('express');
var	app = express();
const firebase= require('firebase');

var najax = $ = require('najax')

app.set('port', (process.env.PORT || 3000))

/* Data LOST
DATA={
                  "islost":true,
                  "name":event.senderobj.display,
                  "userid":event.sender,
                  "phone":context.simpledb.roomleveldata.phone,
                  "itemtype":context.simpledb.roomleveldata.itemtype,
                  "description":context.simpledb.roomleveldata.description,
                  "reward":context.simpledb.roomleveldata.reward,
                  "lat":context.simpledb.roomleveldata.lat,
                  "lang":context.simpledb.roomleveldata.lang
               };

Data FOUND
DATA={
                  "islost":false,
                  "name":event.senderobj.display,
                  "userid":event.sender,
                  "phone":context.simpledb.roomleveldata.phone,
                  "itemtype":context.simpledb.roomleveldata.itemtype,
                  "description":context.simpledb.roomleveldata.description,
                  "foundimage":context.simpledb.roomleveldata.foundimage,
                  "lat":context.simpledb.roomleveldata.lat,
                  "lang":context.simpledb.roomleveldata.lang
               };

*/

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
		var count=Object.keys(jsonObject).length;
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
app.get('/sendprocessretrieve/:Itemdata', function(req, res) {
	// var item = req.params.Itemdata.split('+')[0];
	// var foundOrlost = JSON.parse(req.params.Itemdata.split('+')[2])["islost"];
	var data = JSON.parse(req.params.Itemdata);
	var islost = data["islost"];


	//getcountrycode from the lat lang
	var locationpoocho='http://ws.geonames.org/countryCodeJSON?lat='+data["Lat"]+"&lng="+data["Lang"]+"&username=fetchfindbot";
	$.get(locationpoocho,function(result){
		var countryCode=JSON.parse(result)["countryCode"];

		if(islost){
		//Update lost items , Match items , Send status to bot
		db.ref(countryCode+'/'+ data["itemtype"]+'/lost').push(data)
		}
		else{
			//Update found items , Match items , Send status to bot
		db.ref(countryCode+'/'+ data["itemtype"]+'/found').push(data)	
		}

		});

	//Pushing to individual items node as well as users
	// var newPostKey=db.ref(item+'/'+ foundOrlost).push().key;
	// var userid=data['userid'];
	// var updates={};

	// updates[item+'/'+ foundOrlost +'/'+newPostKey]=data;
	
	// var jsonObject={}
	// jsonObject[newPostKey]=foundOrlost;
	// updates['Users/'+userid+'/'+ foundOrlost]=jsonObject;

	// db.ref().update(updates);

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

app.get('//search/:userId', function(req, res) {
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