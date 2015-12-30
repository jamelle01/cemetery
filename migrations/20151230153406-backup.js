var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable('burials_backup', {
		id: { type: 'int', primaryKey: true, autoIncrement: true },
        sd_type: 'string',
        sd: 'string',
        lot: 'string',
        space: 'string',
        lot_owner: 'string',
        year_purch: 'string',
        first_name: 'string',
        last_name: 'string',
        sex: 'string',
        birth_date: 'string',
        birth_place: 'string',
        death_date: 'string',
        age: 'string', // These are not just simple integers -- can have months, days, etc.
        death_place: 'string',
        death_cause: 'string',
        burial_date: 'string',
        notes: 'string',
        more_notes: 'string',
        hidden_notes: 'string',
        lat: 'real',
        lng: 'real',
        headstone_img: { type: 'blob' }
	}, callback);
};

exports.down = function(db, callback) {
    db.dropTable('burials_backup', callback);
};
