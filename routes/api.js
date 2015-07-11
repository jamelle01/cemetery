var express = require('express');
var router = express.Router();

// All URI's here are prefixed by /api


function mockSearch(req, res, params) {
/*
  console.log("# params = " + req.params.lastName);
  console.log("# query = " + req.query.lastName);
  console.log("# body = " + req.body.lastName);
  console.log(req.route);
  console.log("lastName = " + req.param('lastName'));
  res.send('respond with a resource');
*/
  var lastName = params['last_name'];
  var ary = [];
  if (lastName == "Gross") {
    // One dude.
    ary.push( { firstName: "Ruth",
                lastName: "Gross",
                lat: 42.634859,
                lng: -95.174137,
                img: '/images/hs-gross.jpg'
              } );
    res.send( JSON.stringify(ary) );
  } else if (lastName == "Film") {
    // One dude, no image.
    ary.push( { firstName: "Sir Not Appearing in this",
                lastName: "Film",
                lat: 42.634859,
                lng: -95.174337
                // No image
              } );
    res.send( JSON.stringify(ary) );
  } else if (lastName == "O'Neil") {
    // Multi-dudes
    ary.push( { firstName: "John",
                lastName: "O'Neil",
                lat: 42.635209,
                lng: -95.175525,
                img: '/images/hs-oneil.jpg'
              } );
    ary.push( { firstName: "Margaret",
                lastName: "O'Neil",
                lat: 42.635159,
                lng: -95.175625,
                img: '/images/hs-oneil.jpg'
              } );
    res.send( JSON.stringify(ary) );
  } else {
    // Eventual error condition.
    res.send("none");
  }
}

function getColumns(params) {
  var colNames = new Array();
  var colValues = new Array();
  for (var name in params) {
    if (params[name] != '') {
      colNames.push(name);
      colValues.push(params[name]);
    }
  }
  return [colNames, colValues];
}

// Performs a SELECT...AND query on the DB.
// Returns JSON or "none".
// Client should prevent requests involving no columns,
// but we will program defensively here.  No columns would
// return all records, which we do not want to do, so 
// rather we will return an error.
function doSearch(req, res, params) {
  //mockSearch(req, res, params);
/**/
  var ret = getColumns(params);
  var colNames = ret[0];
  var colValues = ret[1];
  if (colNames.length == 0) {
    res.send("none");
  } else {
    var sqlSelect = 'select sd_type, sd, lot, space, lot_owner, year_purch, first_name, last_name, sex, birth_date, birth_place, death_date, age, death_place, death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng ';

    var sqlWhere = ' where ';

    for (var ci = 0; ci < colNames.length; ci++) {
      sqlWhere = sqlWhere + colNames[ci] + " = $" + (ci+1);
      if (ci + 1 != colNames.length) {
        sqlWhere = ", ";
      }
    }

    var sql = sqlSelect + " from burials " + sqlWhere + ";";

    console.log('sql:');
    console.log(sql);
    console.log(colValues);

    var query = require('../utils/db-utils.js').queryfn();
    console.log('calling query()');

    query(sql, colValues, 
      function(err, rows, result) {
        console.log('in func');
        if (err) {
          console.log(err);
          res.send("none");
        } else {
          // Success.  Send data.  Data could be an array or it could be "none".
          console.log('adding data');
          var burials = new Array();
          rows.forEach(function(row) {
            burials.push( {
              sd_type:       row.sd_type,
              sd:            row.sd,
              lot:           row.lot,
              space:         row.space,
              lot_owner:     row.lot_owner,
              year_purch:    row.year_purch,
              first_name:    row.first_name,
              last_name:     row.last_name,
              sex:           row.sex,
              birth_date:    row.birth_date,
              birth_place:   row.birth_place,
              death_date:    row.death_date,
              age:           row.age,
              death_place:   row.death_place,
              death_cause:   row.death_cause,
              burial_date:   row.burial_date,
              notes:         row.notes,
              more_notes:    row.more_notes,
              hidden_notes:  row.hidden_notes,
              lat:           row.lat,
              lng:           row.lng           
            } );
          });
          console.log('sending data');
          if (burials.length == 0) {
            res.send("none");
          } else {
            res.send( JSON.stringify(burials) );
          }
        }
      });
    console.log('end of method... shouldn\'t see this');


  }
/**/
}

// GET /api/search
router.get('/search', function(req, res) {
  doSearch(req, res, req.query);
});

// POST /api/search
router.post('/search', function(req, res) {
  doSearch(req, res, req.body);
});

module.exports = router;
