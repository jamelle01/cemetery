/**
 * Retrieves all burial objects and passes them to the given callback function.
 *
 * @param {Function} cb is a Function(Array) where the Array contains each burial object.
 */
module.exports.getBurials = function getBurials(cb) {
  var query = require('../utils/db-utils.js').queryfn();

  var sql = 'select id, sd_type, sd, lot, space, lot_owner, year_purch, first_name, ' + 
            'last_name, sex, birth_date, birth_place, death_date, age, death_place, ' +
            'death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng, ' +
            'headstone_img ' +
            'from burials ';

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
            lng:           row.lng,
            headstone_img: row.headstone_img
          } );
        });

        cb(burials);
      }
    });
};


/**
 * Retrieves all burial objects and passes them to the given callback function.
 *
 * @param {Array} colNames contains the names of the columns to search.
 * @param {Array} colValues contains the values to match in the corresponding column names.
 * @param {Function} cb is a Function(Array) where the Array contains each burial object.
 */
module.exports.searchBurials = function searchBurials(colNames, colValues, cb) {
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


/**
 * Updates a burial with latitude, longitude, and a headstone image.
 * This function is responsible for deleting/unlinking the headstone image file
 * upon a successful update.
 *
 * @param {String} filename is the file containing the headstone image.
 * @param {Number} burialID is the database ID of the burial
 * @param {Number} lat is the latitude
 * @param {Number} lng is the longitude
 * @param {Function} cb is a Function(Boolean) where the Boolean indicates whether
 *                      the update was successful
 */
module.exports.updateBurial = function updateBurial(filename, burialID, lat, lng, cb) {
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


/**
 * Updates a burial with a headstone image.
 * This function is responsible for deleting/unlinking the headstone image file
 * upon a successful update.
 *
 * @param {String} filename is the file containing the headstone image.
 * @param {Number} burialID is the database ID of the burial
 * @param {Function} cb is a Function(Boolean) where the Boolean indicates whether
 *                      the update was successful
 */
module.exports.uploadImage = function uploadImage(filename, burialID, cb) {
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


/**
 * Retrieves the headstone image for the given burial ID.
 *
 * @param {Number} burialID is the database ID of the burial.
 * @param {Function} cb is a Function(Buffer, Boolean) where the Buffer contains the
 *                      binary data of the image and the Boolean indicates whether
 *                      an image was found; if there was no image, a "not found"
 *                      image is provided in the Buffer.
 */
module.exports.downloadImage = function downloadImage(burialID, cb) {
  var query = require('../utils/db-utils.js').queryfn();

  if (burialID == 0) {
    // Bit Pit Easter Egg!
    var notFoundImg = require('fs').readFileSync("public/images/no-image.png");
    cb(notFoundImg, false);
    return;
  }

  query("select headstone_img from burials where id = $1", [burialID], 
    function(err, rows) {
      if (err) {
        console.log(err);
        var notFoundImg = require('fs').readFileSync("public/images/no-image.png");
        cb(notFoundImg, false);
      } else {
        if (rows == null || rows.length == 0 || rows[0].headstone_img == null) {
          var notFoundImg = require('fs').readFileSync("public/images/no-image.png");
          cb(notFoundImg, false);
        } else {
          cb(rows[0].headstone_img, true);
        }
      }
    });
};


/**
 * Extracts data from the burials table and exports it to a CSV file, which is stored in
 * 'uploads/sl-cem-data.csv'.  Headstone images are omitted from this export.
 * Those should be extracted separately using extractImages().
 *
 * @param {Function} cb is a Function(Boolean) where the Boolean indicates whether
 *                      the operation was successful.
 */
module.exports.extractCSV = function extractCSV(cb) {
  this.getBurials( function(burials) {
    if (burials.length < 1) {
      console.log('no burials available for download');
      cb(false);
    } else {
      var csvText = '';

      /**
       * Build header using the column names.
       * Omit headstone images.
       * Those should be extracted separately using extractImages().
       */
      var colNames = Object.keys(burials[0]);
      colNames.pop('headstone_img');
      csvText += colNames.join() + '\n';
      
      /**
       * Build rows.
       * Since headstone images were excluded in the previous step,
       * they will by extension be excluded here, too.
       */
      for (var k = 0; k < burials.length; k++) {
        var colValues = [];
        for (var j = 0; j < colNames.length; j++) {
          var colName = colNames[j];
          var colValue = burials[k][colName];

          if (colValue == null) {
            colValues.push(null);
          } else if (colValue.constructor == String) {
            colValues.push('"' + colValue + '"');
          } else {
            colValues.push(colValue);
          }
        }
        csvText += colValues.join() + '\n';
      }
    
      /**
       * Finally, write CSV data to a file.
       */
      require('fs').writeFileSync('uploads/sl-cem-data.csv', csvText);
      cb(true);
    }
  });
};


/**
 * Extracts headstone images from the burials table and exports each image to a JPEG file
 * of the form 'uploads/<ID>.jpg' where <ID> is the burial ID.
 *
 * @param {Function} cb is a Function(Boolean) where the Boolean indicates whether
 *                      the operation was successful.
 */
module.exports.extractImages = function extractImages(cb) {
  var query = require('../utils/db-utils.js').queryfn();
  query("select id, headstone_img from burials where headstone_img is not null", [], 
    function(err, rows) {
      rows.forEach( function(row) {
        require('fs').writeFileSync('uploads/' + row.id + '.jpg', row.headstone_img);
      });
      cb(true);
    });
};

// TODO:
// backup and restore methods for burials_backup table
//  backup -->  delete from burials_backup;
//              insert into burials_backup select * from burials;
//  restore --> delete from burials;
//              insert into burials select * from burials_backup;

