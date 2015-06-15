// This standalone script populates the PostgreSQL DB with data from a CSV file.

function splitCols(line) {
    var buf = "";
    var cols = new Array();
    var inQuotedString = false;
    for (var i = 0; i < line.length; i++) {
        if (line[i] == "," && !inQuotedString) {
            cols.push(buf);
            buf = "";
        } else if (line[i] == "\"") {
            inQuotedString = !inQuotedString;
        } else {
            buf = buf + line[i];
        }
    }
    if (buf == "\r") {
        cols.push("");
    } else if (buf != "") {
        cols.push(buf);
    } else if (cols.length < 20) {
        cols.push("");
    }

/*
    // Clean-up messy date columns.
    var dateIndices = [6, 10, 12, 16];
    for (var y = 0; y < dateIndices.length; y++) {
        var di = dateIndices[y];
        cols[di] = cols[di].replace('**', '01');
        cols[di] = cols[di].replace(' ', '');
        cols[di] = cols[di].replace('?', '');
        cols[di] = cols[di].replace('maybe', '');

        if (cols[di].indexOf('$') >= 0) {
            cols[di] = cols[di].substring(0, cols[di].indexOf('$'));
        }
        if (cols[di].length == 4) {
            cols[di] = "01-01-" + cols[di];
        }
        // At this point, we either have MM-DD-YYYY or MM-YYYY or empty.
        if (cols[di] == "" || cols[di].indexOf("noburial") >= 0 || cols[di].indexOf("none") >= 0) {
            cols[di] = null;
        } else if (cols[di].indexOf("-") == cols[di].lastIndexOf("-")) {
            cols[di] = cols[di].substring(0,2) + "-01-" + cols[di].substring(cols[di].indexOf("-"));
        }
    }
*/
    

    return cols;
}

var fs = require('fs');

var csv = '../docs/cemetery.csv'
var query = require('./db-utils.js').queryfn();

//DEF_LAT = 42.633911;
//DEF_LNG = -95.175977; 
var DEF_LAT = 0;
var DEF_LNG = 0;


query("delete from burials;", function(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('table emptied');
    }
});

query("ALTER SEQUENCE burials_id_seq RESTART WITH 1;", function(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('burials_id_seq reset');
    }
});

var numRows = 0;


fs.readFile(csv, function(err, buf) {
    lines = buf.toString().split('\n');
    var firstLine = true;
    lines.forEach(function(line) {
        if (firstLine) {
            firstLine = false;
            return;
        }
        cols = splitCols(line);

        query("insert into burials (sd_type, sd, lot, space, lot_owner, year_purch, first_name, last_name, sex, birth_date, birth_place, death_date, age, death_place, death_cause, burial_date, notes, more_notes, hidden_notes, lat, lng) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21);",
            [ cols[1],
              cols[2],
              cols[3],
              cols[4],
              cols[5],
              cols[6],
              cols[7],
              cols[8],
              cols[9],
              cols[10],
              cols[11],
              cols[12],
              cols[13],
              cols[14],
              cols[15],
              cols[16],
              cols[17],
              cols[18],
              cols[19],
              DEF_LAT,
              DEF_LNG
            ], 
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log('row inserted with id: ' + result.rows[0].id);
                    numRows++;
                    console.log('Inserted ' + numRows + ' rows.');
                }

            });



        //console.log(cols);
    });
});


