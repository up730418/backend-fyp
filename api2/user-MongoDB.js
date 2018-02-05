const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let dbs;

let db =  MongoClient.connect(url, (err, db) =>{
  assert.equal(null, err, "unable to connect to Database");
  dbs = db;
  return db;
});

module.exports.getUsers = async() => {
  const userCollection = dbs.collection("user");
  let data = await userCollection.find({});
  
  return data? data.toArray() : [];  ;  
};

module.exports.getByUserName = async(userName) => {
  const userCollection = dbs.collection("user");
  let data = await userCollection.findOne({userName: userName});

  return data;  
};

module.exports.createUser = async(userName, firstName, lastName, type) => {
  const userCollection = dbs.collection("user");
  let data = await userCollection.insert({userName: userName, firstName: firstName, 
                                         lastName: lastName, userType: type});

  return data;
    
};

module.exports.updateUser = async(userName, firstName, lastName, type) => {
  const userCollection = dbs.collection("user");
  let data = await userCollection.updateOne({userName: userName}, 
                                                {$set: {userName: userName, firstName: firstName, 
                                                  lastName: lastName, userType: type}},
                                               {upsert: true});
  return data;
};

module.exports.deleteUser = async(userName) => {
  const userCollection = dbs.collection("user");
  let data = await userCollection.remove({userName: userName});

  return data;
};
