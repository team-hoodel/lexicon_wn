
/**
 * Module dependencies.
 */

var http = require('http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var routes = require('./routes');
var EventEmitter = require('events').EventEmitter
var indexRouter = require('./routes/index');
var util = require('util');

var prologDir = './prolog';
var emitter = new EventEmitter;
global.lexicon = require('lexicon')(prologDir, emitter);

var app = express();
app.set('port', process.env.PORT || 7070);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get(/^\/surface\/([^.]+)(?:\.(.+))?/, routes.surface);
app.get(/^\/word\/(\d+)\/(\d+)(?:\.(.+))?/, routes.word);
app.get(/^\/word\/(\d+)_(\d+)(?:\.(.+))?/, routes.word);
app.get(/^\/synset\/(\d+)(?:\.(.+))?/, routes.synset);
app.get(/^\/semantic\/(\d+)(?:\.(.+))?/, routes.semantic);
//app.get('/util/123', routes.util);  // NOT FOR ANYTHING RIGHT NOW

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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
