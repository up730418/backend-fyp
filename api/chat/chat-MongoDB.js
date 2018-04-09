const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let dbs;
const db = MongoClient.connect(url, (err, db) => {
  assert.equal(null, err, 'unable to connect to Database');
  dbs = db;
  return db;
});


module.exports.get = async (id, limit) => {
  const chat = dbs.collection('chat');
  const data = await chat.find({ room: id }).limit(limit).sort({ timeStamp: -1 }).toArray();

  return data;
};

module.exports.put = async (data, user, room) => {
  const chat = dbs.collection('chat');
  const record = await chat.insert([{
    room, data, user, timeStamp: new Date(),
  }]);

  return record.insertedCount;
};


// module.exports.post = async(id, )
