var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

/*-------------------------------------------------------------------
 Helper methods
-------------------------------------------------------------------*/

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
// Returns JSON list, which could be an empty list.
// Client should prevent requests involving no columns,
// but we will program defensively here.  No columns would
// return all records, which we do not want to do, so 
// rather we will return an error.
function doSearch(req, res, params) {
  var ret = getColumns(params);
  var colNames = ret[0];
  var colValues = ret[1];
  if (colNames.length == 0) {
    res.send("[]");
  } else {
    var sqlSelect = 'select id, sd_type, sd, lot, space, lot_owner, year_purch, first_name, last_name, sex, birth_date, birth_place, death_date, age, death_place, death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng ';

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

    query(sql, colValues, 
      function(err, rows, result) {
        if (err) {
          console.log(err);
          res.send("[]");
        } else {
          var burials = new Array();
          rows.forEach(function(row) {
            burials.push( {
              id:            row.id,
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
          res.send( JSON.stringify(burials) );
        }
      });


  }
}

/*-------------------------------------------------------------------
 Routes - all URI's are prefixed with /api
-------------------------------------------------------------------*/

// GET /api/search
router.get('/search', function(req, res) {
  doSearch(req, res, req.query);
});

// POST /api/search
router.post('/search', function(req, res) {
  doSearch(req, res, req.body);
});

// POST /api/img-upload
router.post('/img-upload', upload.single('headstone_img'), function(req, res) {
    var fs = require('fs');
    var query = require('../utils/db-utils.js').queryfn();

    var img = fs.readFileSync(req.file.path);

    query("update burials set headstone_img = $1 where id = $2", [img, req.body.id], 
      function(err, rows) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          fs.unlinkSync(req.file.path);
          res.send("ok");
        }
      });
});

// GET /api/img-download
router.get('/img-download', function(req, res) {
    var query = require('../utils/db-utils.js').queryfn();

    query("select headstone_img from burials where id = $1", [req.query.id], 
      function(err, rows) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          if (rows[0].headstone_img == null) {
            res.header("Content-Type", "image/png");
            var img = require('fs').readFileSync("public/images/no-image.png");
            res.send(img);
          } else {
            res.header("Content-Type", "image/jpg");
            res.send(rows[0].headstone_img);
          }
        }
      });
});

module.exports = router;
