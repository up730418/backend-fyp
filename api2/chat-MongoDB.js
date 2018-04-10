const assert = require('assert');
const mongoUtil = require('../mongoUtil.js');

const dbs = mongoUtil.getDb();


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
