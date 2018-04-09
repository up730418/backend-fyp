const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/data';
let _db;

module.exports = {

  connectToServer(callback) {
    MongoClient.connect(url, (err, db) => {
      _db = db;
      return callback(err);
    });
  },

  getDb() {
    return _db;
  },
};
