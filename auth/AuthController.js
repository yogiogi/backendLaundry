var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

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
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    var name = user.name;
    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token, name: name });
  });

});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function (req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findOne({ email: req.body.email }, function (err, user) {

    if (user) return res.status(400).send({ auth: false, code: 500, message: 'The email address you have entered is already associated with another account.' });
    User.create({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: hashedPassword
    },
      function (err, user) {
        if (err) return res.status(500).send({ auth: false, code: 500, message: 'There was a problem registering the user' });

        // if user is registered without errors
        // create a token
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token, code: 201, message: 'User Succesfully Created' });
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
  res.send('api');
});

router.post('/sendemail', function (req, res) {

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(404).send({ auth: false, code: 500, message: 'No user found.' });
    // crypto.randomBytes(20, function (err, res) {
    var token = crypto.randomBytes(32).toString('hex')
    // done(err, token);
    // });

    // function(done) {
    //   crypto.randomBytes(20, function (err, buf) {
    //     var token = buf.toString('hex');
    //     // done(err, token);
    //   });
    // }

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25,//587,
      auth: {
        user: 'laundryservice98@gmail.com',
        pass: 'qwerty.12345'
      }, tls: {
        rejectUnauthorized: false
      }
    });

    // setup email data with unicode symbols
    var mailOptions = {
      from: 'passwordManager@demo.com',
      to: req.body.email,
      subject: 'Query',

      text:
        'Hi ' + req.body.email + ',\n\n' +
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you don’t use this link within 3 hours, it will expire. To get a new password reset link, visit the forgot password page.\n\n\n' +
        'Thanks\n'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(400).send({ auth: false, code: 500, message: 'Email already sent.' });
      }

      console.log('Message %s sent: %s', info.messageId, info.response);
      res.send(info.responseCode)
    });

    // transporter.sendEMail = function (mailRequest) {
    //   return new Promise(function (resolve, reject) {
    //     transporter.sendMail(mailRequest, (error, info) => {
    //       if (error) {
    //         reject(error);
    //       } else {
    //         resolve("The message was sent!");
    //       }
    //     });
    //   });
    // }
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

module.exports = router;