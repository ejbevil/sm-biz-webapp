var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.engr.oregonstate.edu',
  user            : 'mydb_bevilace',
  password        : '1111',
  database        : 'mydb_bevilace'
});

module.exports.pool = pool;
