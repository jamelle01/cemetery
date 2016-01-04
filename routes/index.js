var express = require('express');
var router = express.Router();

var svc = require('../services/burials.js');


router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/admin/burials', function(req, res) {
  svc.getBurials( function(burialList) {
    res.render('admin/burials', { burials: burialList });
  } );
});

router.get('/admin/burial/:id', function(req, res) {
  res.render('admin/burial', { id: req.params.id });
});

router.get('/test/update-burial', function(req, res) {
  res.render('test/update-burial', { });
});

router.get('/test/img-upload', function(req, res) {
  res.render('test/img-upload', { });
});

router.get('/test/db-upload', function(req, res) {
  res.render('test/db-upload', { });
});

module.exports = router;
