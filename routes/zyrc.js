var express = require('express');
var path = require('path');
const {resolve} = require('path');
var ejs = require('ejs');
var OBSkit = require(resolve(__dirname,'../service/OBSkit'));

var app = express();

var informJson = {
	FuId:0,
	startTime:0,
	endTime:0,
	prefix:'',
	data:''
}

app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set("view engine", "html");

/* GET users listing. */
app.get('/', function(req, res, next) {
  	res.sendFile(resolve(__dirname, '../views/zyrc.html'));
});


app.get('/zyev', function(req, res, next) {
	informJson.FuId = req.query.id;
	informJson.startTime = req.query.startTime;
	informJson.endTime = req.query.endTime;
	informJson.prefix = req.query.prefix;

	console.log("Prefix="+req.query.prefix);
	res.sendFile(resolve(__dirname, '../views/zyrcEv.html'));
});

app.get('/zyevId', function(req, res, next) {
	var para_A;
	//console.log('zyevID  Prefix:'+informJson.prefix);
	OBSkit.getStr(informJson.prefix,para_A,function(contents,prefix,para_B){
		var recordJson = JSON.parse(contents);
		informJson.data = recordJson.data;
		res.json(informJson);
	});

});


app.get('/list', function(req, res, next) {

	var searchDate = req.query.date;
	var prefix = 'Service/ZyRecord/'+searchDate+"/";
	console.log("SearchDate Prefix: "+prefix);

	OBSkit.OBSFolderObj(prefix,app,function(contents,prefix,router){
		var eventListJson = [];
		var smallTime = 0;
		var index = 1;
		var maxInt = 1000;
		var inter = 1;
		if(contents.length>1){
			while(eventListJson.length<contents.length && inter<maxInt){
				inter = inter+1;
				var bigTime = 1000000000000000;
				var evPrefix = '';
				for(let j=0;j<contents.length;j++){
					var eventPrefix = contents[j]['Key'];
					var Xindex = eventPrefix.indexOf('X');
					if(Xindex>0){
						var Yindex = eventPrefix.indexOf('Y');
						var startTimeTemp = parseInt(eventPrefix.substring(Xindex+4,Yindex));
								
						if(startTimeTemp<bigTime && startTimeTemp>smallTime){
							bigTime = startTimeTemp;	
							evPrefix = eventPrefix;
						}
					}
				}
				smallTime = bigTime;
				var Xindex_A = evPrefix.indexOf('X');
				if(Xindex_A>0){
					var Yindex_A = evPrefix.indexOf('Y');
					var startTime = evPrefix.substring(Xindex_A+4,Yindex_A);
					var endTime = evPrefix.substring(Yindex_A+1);
					var fuId = evPrefix.substr(Xindex_A-1,1);
					var recordJson = {
						index : index,
						fuId : fuId,
						startTime : startTime,
						endTime : endTime,
						prefix:evPrefix
					}
					eventListJson.push(recordJson);
					index = index+1;
				}
			}
		}
		res.json(eventListJson);
		console.log('sended');

	});

});

module.exports = app;


