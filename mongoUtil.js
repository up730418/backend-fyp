const MongoClient = require( 'mongodb' ).MongoClient;
const url = 'mongodb://localhost:27017/data';
let _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( url  , function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};