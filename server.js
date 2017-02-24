var express = require('express');
var path = require('path');
var najax = $ = require('najax');
const firebase= require('firebase');
var hbs=require('express-handlebars');
var basicAuth = require('express-basic-auth');


var	app = express();
// var auth = basicAuth('testUser', 'testPass');



// view engine setup------------------------------------------

app.engine('hbs', hbs({extname:'hbs'}));
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'hbs');

app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname,'views')));

// Initializing firebase ---------------------------------------

var config = {
	apiKey: "AIzaSyCUcgbm-0Yfhv1YF1UREO7iy8zZdoSNl5s",
	authDomain: " fetchfind-12fc9.firebaseapp.com",
	databaseURL: "https://fetchfind-12fc9.firebaseio.com",
};

firebase.database.enableLogging(true);
firebase.initializeApp(config);
var db = firebase.database();

//--------------------------------------------------------------

app.get('/', function(req, res) {
	res.send("Welcome to Sparreo !");
});

//--------------------------------------------------------------

app.get('/privacy', function(req, res) {
	res.sendFile(path.join(__dirname,'views/privacypolicy.htm'));
});

//--------------------------------------------------------------

app.get('/getdate', function(req, res) {
	var dateAndTime = calDate();
	res.send(dateAndTime);
});

//--------------------------------------------------------------

app.get('/admin', function(req, res) {
	var lostData = {};
	var foundData = {};
	var matchesData = {};
	var data = [];
	db.ref('/').once('value',function(snap){
		var obj=snap.val();
		for( var country in obj){
			for (var items in obj[country]){
				for(var lostOrFound in obj[country][items]){
					for(var finalObjects in obj[country][items][lostOrFound]){
						var object=obj[country][items][lostOrFound][finalObjects];
						var curr_data={};
						curr_data['lang']=object.lang;
						curr_data['lat']=object.lat;
						curr_data['islost']=object.islost;
						data.push(curr_data);

					}
				}
					

			}
		}
		res.render('adminHome',{dataVar:data});
	});

	// 
});

//--------------------------------------------------------------


app.get('/removefinder/:details',function(req,res){
	var details=JSON.parse(req.params.details);
	var dbRef=db.ref(details.countryCode+'/'+details.tempData.itemtype+"/found");
	var dbDeploy=db.ref(details.countryCode+'/'+details.tempData.itemtype+"/matches");
	dbRef.once("value",function(snap){
		snap.forEach(function(v){
			if(v.val().userid==details.finderID){
				//match made in heaven
				var matchitem={
					"dateMatched": calDate(),
					"finder":v.val(),
					"owner":details.tempData
				}
				dbDeploy.push(matchitem);
				dbRef.child(v.key).remove();
				res.send("perfecto");
			}
		});
	});
});


//--------------------------------------------------------------

// Updating the Items
app.get('/sendprocessretrieve/:Itemdata/', function(req, res) {
	// res.send('hiii '+JSON.parse(req.params.Itemdata));
	var data = JSON.parse(req.params.Itemdata);
	console.log(data);
	var islost = data["islost"];


	//getcountrycode from the lat lang
	var locationpoocho='http://ws.geonames.org/countryCodeJSON?lat='+data["lat"]+"&lng="+data["lang"]+"&username=fetchfindbot";
	$.get(locationpoocho,function(result){
		var countryCode=JSON.parse(result)["countryCode"];
		data.dateAdded= calDate();
		if(islost===true){
			//LOST 	
			//Update lost items , Match items , Send status to bot
			var dbRef=db.ref(countryCode+'/'+ data["itemtype"]+'/lost');

			  if (data.torf)dbRef.push(data);
			
			initiatematchingwithfound(countryCode, data); //this function runs each time refresh is called

			}
		else{
				//FOUND
				//Update found items , Match items , Send status to bot
				db.ref(countryCode+'/'+ data["itemtype"]+'/found').push(data);
				res.send("all ok");
			}

			function initiatematchingwithfound(countryCode, lostdata){
				console.log("I am called")
				db.ref(countryCode+'/'+lostdata["itemtype"]+'/found').once('value',function(snap){
					console.log("The output is: ",snap.val());

					var obj=snap.val();
					if(!obj){
						res.end("andhera kayam");
						return;
					}
					else{
					var founditemsincountry = Object.keys(obj).map(function(key) {

			    			return obj[key];
							});

					var items=[];

					for(var i=0;i<founditemsincountry.length;i++){
						var iteratedfounditem=founditemsincountry[i];
						var distance=calcCrow(iteratedfounditem,lostdata);

						if(distance<5 && priceCheck(iteratedfounditem.reward,lostdata.reward)===true){
								var item=iteratedfounditem.itemtype;
								if(item=="bank card" || item=="id card" || item=="passport"){
									if(lostdata.uniquename==iteratedfounditem.uniquename){
										var prepareditem={
					          				"title":"Exact Match ",
					          				"subtitle":distance+" km away | Reward demanded: "+iteratedfounditem.reward,
					          				"imgurl":iteratedfounditem.foundimage,
					          				"name":iteratedfounditem.name,
					          				"phone":iteratedfounditem.phone,
					          				"reward":iteratedfounditem.reward,
					          				"options":[
					          				{
					          					"type":"text",
					          					"title":iteratedfounditem.userid+'#0'
					          				}]
			          					};
										items=[prepareditem];
										break;
									}
								}
			          			//prepare this item now
			          			var prepareditem={
			          				"title":"Match "+i+1,
			          				"subtitle":distance+" km away | Reward demanded: "+iteratedfounditem.reward,
			          				"imgurl":iteratedfounditem.foundimage,
			          				"name":iteratedfounditem.name,
			          				"phone":iteratedfounditem.phone,
			          				"reward":iteratedfounditem.reward,
			          				"options":[
			          				{
			          					"type":"text",
			          					"title":iteratedfounditem.userid+'#'+i
			          				}]
			          			};
			          			items.push(prepareditem);
			          		}	//if match
			          	}//for loop

			          //all weapons deployed
			          //ab goli maaro
			          res.send(items)
			          return;


			      } //else
			      	});
			  }


		});	

});




      function priceCheck(foundPrice,lostPrice){
      	var fp=foundPrice.split(' ')[1];
      	var lp=lostPrice.split(' ')[1];
      	return fp<=2*lp;
      }

      function calDate(){

  	    	var monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
  			"July", "Aug", "Sep", "Oct", "Nov", "Dec"];
      	 	var currentTime = new Date();
			var currentOffset = currentTime.getTimezoneOffset();
			var ISTOffset = 330;   // IST offset UTC +5:30 
			var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
			// ISTTime now represents the time in IST coordinates
			var amOrpm="AM";
			var hoursIST = ISTTime.getHours();
			if(hoursIST>=12){
				hoursIST=hoursIST-12;
				amOrpm="PM";
			}
			if(hoursIST==0){
				hoursIST=12;
			}

			hoursIST = hoursIST<10?"0"+hoursIST:hoursIST;


			var minutesIST = ISTTime.getMinutes();
			minutesIST = minutesIST<10?"0"+minutesIST:minutesIST;
			var dateIST = ISTTime.getDate();
			var monthIST = ISTTime.getMonth();
			var yearIST = ISTTime.getYear()+1900;

			var dateAndTime = dateIST+" "+monthNames[monthIST] +" "+yearIST+"; "+hoursIST+":"+minutesIST+" "+amOrpm;

			return dateAndTime;
      }


      function calcCrow(data1,data2){
      	var lat1=Number(data1["lat"]);var lon1=Number(data1["lang"]);var lat2=Number(data2["lat"]);var lon2=Number(data2["lang"]);
    	//lat1, lon1, lat2, lon2
	    var R = 6371; // km
	    var dLat = toRad(lat2-lat1);
	    var dLon = toRad(lon2-lon1);
	    var lat1 = toRad(lat1);
	    var lat2 = toRad(lat2);

	    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	    var d = R * c;
	    return d.toFixed(2);
	}


	 function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }


//--------------------------------------------------------------

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


//--------------------------------------------------------------

app.get('/search/:userId', function(req, res) {
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