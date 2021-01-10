
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var EventEmitter = require('events').EventEmitter

var util = require('util');
var prologDir = './prolog';
var emitter = new EventEmitter;
global.lexicon = require('lexicon')(prologDir, emitter);

var app = express();

// all environments
//app.configure(functon () {
    app.set('port', process.env.PORT || 7070);
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(function(req, res, next) {
        res.send('Sorry ' + req.url + ' does not exist.');
    });
//    app.use(function(err, req, res, next) {
//        console.log(util.inspect(err));
//        res.send(err.message);
//    });
//});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get(/^\/surface\/([^.]+)(?:\.(.+))?/, routes.surface);
app.get(/^\/word\/(\d+)\/(\d+)(?:\.(.+))?/, routes.word);
app.get(/^\/word\/(\d+)_(\d+)(?:\.(.+))?/, routes.word);
app.get(/^\/synset\/(\d+)(?:\.(.+))?/, routes.synset);
app.get(/^\/semantic\/(\d+)(?:\.(.+))?/, routes.semantic);
app.get('/util/123', routes.util);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
