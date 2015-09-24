var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/test/img-upload', function(req, res) {
  res.render('test/img-upload', {  });
});

module.exports = router;
