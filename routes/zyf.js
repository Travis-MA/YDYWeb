var express = require('express');
var path = require('path');
const {resolve} = require('path');
var ejs = require('ejs');
const fs = require('fs');
var OBSkit = require(resolve(__dirname,'../service/OBSkit'));


var gb = require('json-groupby');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set("view engine", "html");

/* GET users listing. */
app.get('/', function(req, res, next) {
	console.log('sending file');
  	res.sendFile(resolve(__dirname, '../views/zyf.html'));
  	//res.json(jsonToClient);
});




app.get('/datafu', function (req, res, next) {
	var FuId = req.query.FuId;
	var prefix = "Service/ZyRealTime/clave"+FuId;

	OBSkit.getStr(prefix,0,function(contents,prefix,para){
		var jsdata = JSON.parse(contents);
		res.json(jsdata);		
	});
});

module.exports = app;


