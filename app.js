var express = require('express');
var app = express();
var db = require('./db');
global.__root = __dirname + '/';

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

// var resetPassword = require(__root + 'view/reset.jade');
app.get('/reset', function(req, res){
  res.status(200).render(__root + 'view/reset.pug');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);


module.exports = app;