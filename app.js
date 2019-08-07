var express = require('express');

var db = require('./db');
global.__root = __dirname + '/';

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session')
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var flash = require('express-flash');
const engines = require("consolidate");

var app = express();
app.set('port', process.env.PORT || 3000);
// app.set('view', path.join(__dirname, 'view'));
// app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'session secret key' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

// var resetPassword = require(__root + 'view/reset.jade');
app.get('/tesres', function (req, res) {
  res.status(200).render('reset.pug');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var paymentController = require(__root + 'payment/payment');
app.use('/api/payment', paymentController);

app.get('/', (req, res) => {
  res.render("index");
})

// var postinsert = require(_root + 'data/postinsert');
// app.use('/api/data', postinsert);

// app.listen(3000, () => {
//   console.log("server is running");
// })

module.exports = app;