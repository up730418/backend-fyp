const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/data';
let mongoDB;

module.exports = {

  connectToServer(callback) {
    MongoClient.connect(url, (err, db) => {
      mongoDB = db;
      return callback(err);
    });
  },

  getDb() {
    return mongoDB;
  },
};
