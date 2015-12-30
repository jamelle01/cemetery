var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var svc = require('../services/burials.js');


/**
 * Separates parameter names and values into separate Arrays so
 * that they can be passed to the burials service.
 *
 * @param {Object} params the HTTP parameters
 * @return {Array} [0]: column names,
 *                 [1]: column values
 */
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


/**
 * Retrieves all burials as JSON for records whose DB column name/values match
 * the HTTP params given.  This is a search function, so if no params are given,
 * we will simply send an empty list (though, we would hope clients should prevent
 * such meaningless requests).
 *
 * @param {IncomingMessage} req the HTTP request
 * @param {ServerResponse} res the HTTP response used to send a JSON Array back to the client
 * @param {Object} params An abstraction that either refers to HTTP GET query
 *          or POST body params
 */
function doSearch(req, res, params) {
  var ret = getColumns(params);
  var colNames = ret[0];
  var colValues = ret[1];
  if (colNames.length == 0) {
    res.send("[]");
  } else {
    svc.searchBurials(colNames, colValues, function(burialList) {
      res.send( JSON.stringify(burialList) );
    });
  }
}

/*-------------------------------------------------------------------
---------------------------------------------------------------------

 Routes - all URI's are prefixed with /api

---------------------------------------------------------------------
-------------------------------------------------------------------*/


// GET /api/search
router.get('/search', function(req, res) {
  doSearch(req, res, req.query);
});


// POST /api/search
router.post('/search', function(req, res) {
  doSearch(req, res, req.body);
});


// GET /api/burial-summary
// Used by camera app to retrieve ALL burials.
router.get('/burial-summary', function(req, res) {
  svc.getBurials( function(burials) {
    var summaryList = new Array();
    for (var i = 0; i < burials.length; i++) {
        if (burials[i].last_name != "") {
            var obj = { "id"         : burials[i].id,
                        "first_name" : burials[i].first_name,
                        "last_name"  : burials[i].last_name,
                        "birth_date" : burials[i].birth_date,
                        "death_date" : burials[i].death_date };
            summaryList.push(obj);
        }
    }  
    res.send( JSON.stringify(summaryList) );
  });
});


// POST /api/update-burial
// Used by camera app to update the lat, lng, and headstone_image of a single burial.
router.post('/update-burial', upload.single('headstone_img'), function(req, res) {
  svc.updateBurial(req.file.path, req.body.id, req.body.lat, req.body.lng, function(success) {
    if (success) {
      res.send("ok");
    } else {
      res.send("error");
    }
  });
});


// POST /api/img-upload
router.post('/img-upload', upload.single('headstone_img'), function(req, res) {
  svc.uploadImage(req.file.path, req.body.id, function(success) {
    if (success) {
      res.send("ok");
    } else {
      res.send("error");
    }
  });
});


// GET /api/img-download
router.get('/img-download/:id', function(req, res) {
  svc.downloadImage(req.params.id, function(image, success) {
    if (success) {
      // All headstone photos are JPEGs.
      res.header("Content-Type", "image/jpg");
    } else {
      // All "not found" images are PNGs.
      res.header("Content-Type", "image/png");
    }
    res.send(image);
  });
});


// GET /api/db-download
// TODO: use svc.extractCSV() and extractImages() to generate files,
//    then make ZIP containing the CSV and JPEGS
//    use archiver:
//    http://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
router.get('/db-download', function(req, res) {
  svc.getBurials( function(burials) {
    if (burials.length < 1) {
      console.log("no burials available for download");
      res.send("error");
    } else {
      var csvText = "";

      // Build header.
      var colNames = Object.keys(burials[0]);
      csvText += colNames.join() + "\n";
      
      // Build rows.
      for (var k = 0; k < burials.length; k++) {
        var colValues = [];
        for (var j = 0; j < colNames.length; j++) {
          var colName = colNames[j];
          var colValue = burials[k][colName];

          if (colValue == null) {
            colValues.push(null);
          } else if (colValue.constructor == String) {
            colValues.push("\"" + colValue + "\"");
          } else if (colValue.constructor == Buffer) {
            colValues.push("\"" + colValue.toString("utf-8") + "\"");
          } else {
            colValues.push(colValue);
          }
        }
        text += colValues.join() + "\n";
      }

      // Send data.
      res.header("Content-Type", "text/csv");
      res.send(text);
    }
  });
});


// POST /api/db-upload
router.post('/db-upload', function(req, res) {
  res.send("/api/db-upload not yet implemented")
  // FIXME
  // Receive CSV file
  // Read header to construct order of SQL
  // Drop existing table (maybe rename to save any old data?)
  // For each row, insert
});


// TODO: remove this... exists for testing purposes only
router.get('/extract-images', function(req, res) {
  svc.extractImages( function(success) {
    if (success) {
      res.send("ok");
    } else {
      res.send("error");
    }
  });
});

// TODO: remove this... exists for testing purposes only
router.get('/extract-csv', function(req, res) {
  svc.extractCSV( function(success) {
    if (success) {
      res.send("ok");
    } else {
      res.send("error");
    }
  });
});

module.exports = router;
