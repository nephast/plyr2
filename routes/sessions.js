var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var models = require('../models');
var session = require('express-session');

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('sessions/login', { title: 'User Login', flash: req.flash('loginError') });
});

router.post('/login', function(req, res, next) {
    models.User.findOne({
    where: { email: req.body.email }
  })
    .then(function(user){
      if (bcrypt.compareSync(req.body.password, user.dataValues.password_digest)) {
        req.session.user = user;
        res.redirect('/');
      } else {
        req.flash("loginError", "Incorrect email or password");
        res.redirect('/sessions/login');
      }
    })
    .catch(function(error) {
      req.flash("loginError", "Incorrect email or password");
      res.redirect('/sessions/login');
    });
});

router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash("logout", "Successfully logged out!");
  res.redirect('/');
});

router.get('/:id/requests/index', function(req, res, next) {
  models.Sport.findAll({}).then(function(sports) {
    models.Event.findAll({}).then(function(events) {
      models.Request.findAll({where: {UserId: req.session.user.id}}).then(function(myRequests) {
        models.Status.findAll({}).then(function(statuses) {
          models.User.findAll({}).then(function(users) {
            models.Event.findAll({where: {UserId: req.session.user.id}}).then(function(myEvents) {
              if (myEvents.length === 0) {
                res.render("events/requests/index", {myRequests: myRequests,
                                                    receivedRequests: [],
                                                    title1: "Received requests",
                                                    title2: "Sent requests",
                                                    events: events,
                                                    sports: sports,
                                                    statuses: statuses,
                                                    users: users})
              } else {
                models.Request.findAll({where: {
                    EventId: {
                      $any: myEvents.map(function(elem) { return elem.id })
                    }
                }}).then(function(receivedRequests) {
                  res.render("events/requests/index", {myRequests: myRequests,
                                                      receivedRequests: receivedRequests,
                                                      title1: "Received requests",
                                                      title2: "Sent requests",
                                                      events: events,
                                                      sports: sports,
                                                      statuses: statuses,
                                                      users: users})
                })
              }
            })
          })
        })
      })
    })
  })
})

module.exports = router;
