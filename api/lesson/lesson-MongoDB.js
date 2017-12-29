const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let dbs;
let db =  MongoClient.connect(url, (err, db) =>{
  assert.equal(null, err, "unable to connect to Database");
  dbs = db;
  return db;
});


module.exports.getById = async(id) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({lessonId: parseInt(id)});

  return data;  
};

module.exports.getAll = async(owner) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.find({owner: owner});

  return data.toArray();  
};

module.exports.create = async(pollId, data) => {
   const lessonCollection = dbs.collection("lesson");
   let lastRec = await lessonCollection.findOne({}, {sort: {"pollId": -1}})
   console.log("last rec", lastRec.lessonId)
   data.lessonId = lastRec.lessonId + 1;
   lessonCollection.insert([data])
   return data.lessonId
};

module.exports.update = async(pollId, data) => {
   const lessonCollection = dbs.collection("lesson");
   lessonCollection.updateOne({lessonId: parseInt(pollId)}, 
                                          {$set: data},
                                          { upsert: true, });
   return data.lessonId
 
};

module.exports.delete = async(id) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.remove({lessonId: parseInt(id)});

  return data;  
};

