var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var archiver = require('archiver');
var rmdir = require('rimraf');
var decompress = require('decompress');

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
router.get('/db-download', function(req, res) {
  /**
   * ddir is the directory where the zip file will reside
   * sdir is the staging directory for the contents of the zip file
   */
  var ddir = 'downloads';
  var sdir = ddir + '/sl-cem-data';

  var dateStr = (new Date())
                  .toISOString()
                  .replace('-','')
                  .replace('-','')
                  .replace(':','')
                  .replace(':','')
                  .substr(0,15);

  var zipFilename = 'sl-cem-data-' + dateStr + '.zip';
  var zipPath = ddir + '/' + zipFilename;

  // Verify that there is a downloads directory.
  try {
    // If this triggers an exception, then we do need to create ddir.
    var st = fs.statSync(ddir);
  } catch (e) {
    console.log('creating ' + ddir);
    fs.mkdirSync(ddir);
  }

  // Verify that there is no leftover sdir directory.
  try {
    // If this triggers an exception, then we do not need to remove sdir.
    var st = fs.statSync(sdir);

    rmdir(sdir, function(err) {});

  } catch (e) {
    // sdir does not exist.  We do not need to delete it.  Do nothing.
  }

  // Create an empty sdir directory.
  fs.mkdirSync(sdir);

  // Extract images, burials table (as a CSV file), ZIP up the contents, and send it to the browser.
  svc.extractImages(sdir, function(success) {
    if (success) {
      svc.extractCSV(sdir, function(success) {
        var output = fs.createWriteStream(zipPath);
        var archive = archiver('zip');

        archive.pipe(output);

        output.on('close', function() {
          // Send ZIP.
          res.header('Content-Type', 'application/zip');
          res.header('Content-Disposition', 'attachment; filename=' + zipFilename);
          res.send( fs.readFileSync(zipPath) );

          // Clean up staging directory.
          rmdir(sdir, function(err) {});
        });

        archive
          .directory(sdir, '/', {})
          .finalize();

      });
    }
  });

});


// POST /api/db-upload
router.post('/db-upload', upload.single('zipfile'), function(req, res) {
  var dateStr = (new Date())
                  .toISOString()
                  .replace('-','')
                  .replace('-','')
                  .replace(':','')
                  .replace(':','')
                  .substr(0,15);

  var spath = 'uploads/sl-cem-data-' + dateStr;

  try {
    new decompress({mode: '755'})
      .src(req.file.path)
      .dest(spath)
      .use(decompress.zip({strip: 1}))
      .run(function(err, files) {
        svc.backupBurialsToTable(function(success) {
          svc.restoreBurialsFromFiles(spath, function() {
            // Clean up and respond.
            fs.unlinkSync(req.file.path);
            rmdir(spath, function(err) {});
            res.send('ok')
          });
        });
      });
  } catch (e) {
    console.log(e);
    res.send('error');
  }
});


//router.get('/extract-images', function(req, res) {
//  svc.extractImages('uploads', function(success) {
//    if (success) {
//      res.send("ok");
//    } else {
//      res.send("error");
//    }
//  });
//});


//router.get('/extract-csv', function(req, res) {
//  svc.extractCSV('uploads', function(success) {
//    if (success) {
//      res.send("ok");
//    } else {
//      res.send("error");
//    }
//  });
//});

module.exports = router;
