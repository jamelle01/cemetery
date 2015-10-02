module.exports.getBurials = function(cb) {
  var query = require('../utils/db-utils.js').queryfn();

  var sql = 'select id, sd_type, sd, lot, space, lot_owner, year_purch, first_name, ' + 
            'last_name, sex, birth_date, birth_place, death_date, age, death_place, ' +
            'death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng ' +
            'from burials where id < 100'; // FIXME added WHERE for temporary debugging
                                           //    ... to be removed in production
                                           //      or when pagination is implemented

  query(sql, [], 
    function(err, rows, result) {
      if (err) {
        console.log(err);
        cb([]);
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

        cb(burials);
      }
    });
};

module.exports.searchBurials = function(colNames, colValues, cb) {
  var sqlSelect = 'select id, sd_type, sd, lot, space, lot_owner, year_purch, first_name, ' + 
                  'last_name, sex, birth_date, birth_place, death_date, age, death_place, ' +
                  'death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng ';

  var sqlWhere = ' where ';

  for (var ci = 0; ci < colNames.length; ci++) {
    sqlWhere = sqlWhere + colNames[ci] + " like $" + (ci+1);
    if (ci + 1 != colNames.length) {
      sqlWhere = sqlWhere + "and ";
    }
  }

  var sql = sqlSelect + " from burials " + sqlWhere + ";";

  for (var i = 0; i < colValues.length; i++) {
    colValues[i] = "%" + colValues[i] + "%";
  }

  console.log('sql:');
  console.log(sql);
  console.log(colValues);


  var query = require('../utils/db-utils.js').queryfn();

  query(sql, colValues, 
    function(err, rows, result) {
      if (err) {
        console.log(err);
        cb([]);
      } else {
        var burials = new Array();
        console.log("# rows: " + rows.length);
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

        cb(burials);
      }
    });

};

module.exports.updateBurial = function(filename, burialID, lat, lng, cb) {
  var fs = require('fs');
  var query = require('../utils/db-utils.js').queryfn();

  var img = fs.readFileSync(filename);

  query("update burials set headstone_img = $1, lat = $2, lng = $3 where id = $4",
        [img, lat, lng, burialID], 
    function(err, rows) {
      if (err) {
        console.log(err);
        cb(false);
      } else {
        fs.unlinkSync(filename);
        cb(true);
      }
    });
};

module.exports.uploadImage = function(filename, burialID, cb) {
  var fs = require('fs');
  var query = require('../utils/db-utils.js').queryfn();

  var img = fs.readFileSync(filename);

  query("update burials set headstone_img = $1 where id = $2", [img, burialID], 
    function(err, rows) {
      if (err) {
        console.log(err);
        cb(false);
      } else {
        fs.unlinkSync(filename);
        cb(true);
      }
    });
  // FIXME Will we want to check the image for EXIF location data, and then also
  // update lat/lng in burials?
};

module.exports.downloadImage = function(burialID, cb) {
  var query = require('../utils/db-utils.js').queryfn();

  query("select headstone_img from burials where id = $1", [burialID], 
    function(err, rows) {
      if (err) {
        console.log(err);
        var notFoundImg = require('fs').readFileSync("public/images/no-image.png");
        cb(notFoundImg, false);
      } else {
        if (rows[0].headstone_img == null) {
          var notFoundImg = require('fs').readFileSync("public/images/no-image.png");
          cb(notFoundImg, false);
        } else {
          cb(rows[0].headstone_img, true);
        }
      }
    });
};
