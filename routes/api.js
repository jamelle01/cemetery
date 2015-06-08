var express = require('express');
var router = express.Router();

// All URI's here are prefixed by /api

function doSearch(req, res) {
/*
  console.log("# params = " + req.params.lastName);
  console.log("# query = " + req.query.lastName);
  console.log("# body = " + req.body.lastName);
  console.log(req.route);
  console.log("lastName = " + req.param('lastName'));
  res.send('respond with a resource');
*/
  var lastName = req.param('lastName');
  var ary = [];
  if (lastName == "McClinton") {
    // One dude.
    ary.push( { firstName: "Albert",
                lastName: "McClinton",
                lat: 42.634859,
                lng: -95.174137
              } );
    res.send( JSON.stringify(ary) );
  } else if (lastName == "Smith") {
    // Multi-dudes
    ary.push( { firstName: "John",
                lastName: "Smith",
                lat: 42.635209,
                lng: -95.175525
              } );
    ary.push( { firstName: "Jim",
                lastName: "Smith",
                lat: 42.635159,
                lng: -95.175625
              } );
    res.send( JSON.stringify(ary) );
  } else {
    // Eventual error condition.
    res.send("none");
  }
}

// GET /api/search
router.get('/search', function(req, res) {
  doSearch(req, res);
});

// POST /api/search
router.post('/search', function(req, res) {
  doSearch(req, res);
});

module.exports = router;
