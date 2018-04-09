const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUtil = require( '../mongoUtil.js' );
const dbs = mongoUtil.getDb();


module.exports.get = async(id, limit) => {
  
  const chat = dbs.collection("chat");
  let data = await chat.find({room: id}).limit(limit).sort({"timeStamp": -1}).toArray();
  
  return data;  
};

module.exports.put = async(data, user, room) => {
 
  const chat = dbs.collection("chat");
  let record = await chat.insert([{room: room, data: data, user: user, timeStamp: new Date()}])
  
  return record.insertedCount;
};


//module.exports.post = async(id, )