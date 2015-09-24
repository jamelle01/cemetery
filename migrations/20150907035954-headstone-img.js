var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    // Type 'blob' will map to 'bytea' in PostgreSQL.
    db.addColumn('burials', 'headstone_img', { type: 'blob' }, callback);
};

exports.down = function(db, callback) {
    db.removeColumn('burials', 'headstone_img', callback);
};
