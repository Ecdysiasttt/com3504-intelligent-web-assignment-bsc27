var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
// var bootstrap = require('bootstrap');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var plantRouter = require('./routes/plants');
var chatRouter = require('./routes/chatroom');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public/images/uploads', express.static(path.join(__dirname, '/public/images/uploads')));
app.use('/public/images', express.static(path.join(__dirname, '/public/images')));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '200mb' }));
// app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/plants', plantRouter);
app.use('/chatroom', chatRouter);

// catch 404 and forward to error handler
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

module.exports = app;
