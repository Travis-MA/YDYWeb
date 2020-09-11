var express = require('express');
var path = require('path');
const {resolve} = require('path');
var ejs = require('ejs');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set("view engine", "html");

/* GET users listing. */
app.get('/', function(req, res, next) {
  	res.sendFile(resolve(__dirname, '../views/rqgl.html'));
});

module.exports = app;


