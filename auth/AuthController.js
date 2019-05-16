var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var moment = require('moment');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file
var async = require('async');
var crypto = require('crypto');

router.post('/login', function (req, res) {

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send({
      auth: false,
      code: 500,
      token: null,
      message: "Error on the server.",
    });

    if (!user) return res.status(404).send({
      auth: false,
      code: 500,
      token: null,
      message: "Email Not Found",
    });

    console.log("save passwrod", user.password);
    console.log("return passwrod", req.body.password);

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) return res.status(401).send({
      auth: false,
      code: 500,
      token: null,
      message: "Invalid Password",
    });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    var name = user.name;
    // return the information including token as JSON
    res.status(200).send
      ({
        auth: true,
        code: 200,
        token: token,
        message: "Login Succesfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            password: "",
            firstname: user.firstname,
            lastname: user.lastname,
            created_at: {
              time: user.created_at,
              valid: true,
            },
            updated_at: {
              time: "",
              valid: true,
            }
          }
        }
      });
  });

});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function (req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findOne({ email: req.body.email }, function (err, email) {
    // if (email) return res.status(404).send('No user found.');
    if (email) return res.status(400).send({
      auth: false,
      code: 400,
      message: 'The email address you have entered is already associated with another account.'
    });

    User.create({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: hashedPassword,
      created_at: moment().format(),
      updated_at: moment().format()
    },
      function (err, user) {
        if (err) return res.status(500).send({
          auth: false,
          code: 500,
          message: 'There was a problem registering the user'
        });

        // if user is registered without errors
        // create a token
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({
          auth: true,
          token: token,
          code: 201,
          message: 'User Succesfully Created'
        });
      });
  });
});

router.get('/me', VerifyToken, function (req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

router.get('/', function (req, res) {
  // res.send('api');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          // res.send('No account with that email address exists.');
          return res.redirect('/api/auth/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        console.log('user', user);
        console.log('token', token);

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
          user: 'laundryservice98@gmail.com',
          pass: 'qwerty.12345'
        }, tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'laundryservice98@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://localhost:3000' + '/api/auth/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!error) return res.status(200).send({ auth: false, code: 200, message: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        // res.send(info.responseCode);

        // // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        // done(err, 'An e-mail has been sent to');
      });
    }
  ], function (err) {
    if (err) return next(err);
    // res.send('baaaa');
    res.redirect('/api/auth/forgot');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/api/auth/forgot');
    }
    // res.send('resetnya');
    res.status(200).render('reset.pug', {
      user: req.user
    });
    // res.render('reset.pug', {
    //   user: req.user
    // });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        console.log('user', user);
        // console.log('token', token);

        user.save(function (err) {
          // req.logIn(user, function (err) {
          done(err, user);
          // });
        });
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
          user: 'laundryservice98@gmail.com',
          pass: 'qwerty.12345'
        }, tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/api/auth/');
  });
});

module.exports = router;