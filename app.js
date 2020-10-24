var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var compression = require('compression');

var app = express();
app.use(compression());


app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set("view engine", "html");



// 加载日志中间件
app.use(logger('dev'));
// 加载解析json的中间件
app.use(express.json());
// 加载解析urlencoded请求体的中间件
app.use(express.urlencoded({ extended: false }));
// 加载解析cookie的中间件
app.use(cookieParser());
// 设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

//参数‘/’可当作设置url的根显示页面，这里即”http://localhost:3000/“访问的页面设置为index.html
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/views/"+"zyrc.html")        //设置/ 下访问文件位置
});


// 路由控制器
var indexRouter = require('./routes/index');
var zyfRouter = require('./routes/zyf');
var zyrcRouter = require('./routes/zyrc');

app.use('/', indexRouter);
app.use('/zyf', zyfRouter);
app.use('/zyrc', zyrcRouter);
app.use('/zyrcEv', zyrcRouter);

// 捕获404错误，并转发到错误处理器
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// 导出app实例，供其他模块调用
module.exports = app;

var server =app.listen(3000,()=>{
var port =server.address().port
     console.log("【】访问地址http://localhost:%s",port)
});



//ScheduleProc.startScheduleCycle();


