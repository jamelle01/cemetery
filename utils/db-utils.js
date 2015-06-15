var conf = require('../database.json'); // This file is shared with db-migrate.
var env = 'dev';

module.exports.queryfn = function() {
    var q = require('pg-query');
    q.connectionParameters =
        process.env.DATABASE_URL ||
            'postgres://' + conf[env].user + ':' + conf[env].password + '@'
                          + conf[env].host + '/' + conf[env].database;
    //console.log("using " + q.connectionParameters);
    return q;
};
