const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUtil = require('../mongoUtil.js');

const dbs = mongoUtil.getDb();

module.exports.getUsers = async () => {
  const userCollection = dbs.collection('user');
  const data = await userCollection.find({});

  return data ? data.toArray() : [];
};

module.exports.getByUserName = async (userName) => {
  const userCollection = dbs.collection('user');
  const data = await userCollection.findOne({ userName });

  return data;
};

module.exports.createUser = async (userName, firstName, lastName, type) => {
  const userCollection = dbs.collection('user');
  const data = await userCollection.insert({
    userName,
    firstName,
    lastName,
    userType: type,
  });

  return data;
};

module.exports.updateUser = async (userName, firstName, lastName, type) => {
  const userCollection = dbs.collection('user');
  const data = await userCollection.updateOne(
    { userName },
    {
      $set: {
        userName,
        firstName,
        lastName,
        userType: type,
      },
    },
    { upsert: true },
  );
  return data;
};

module.exports.deleteUser = async (userName) => {
  const userCollection = dbs.collection('user');
  const data = await userCollection.remove({ userName });

  return data;
};
