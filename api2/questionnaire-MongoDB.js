const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let dbs;
let db =  MongoClient.connect(url, (err, db) =>{
  assert.equal(null, err, "unable to connect to Database");
  dbs = db;
  return db;
});


module.exports.get = async(id) => {
  const questionnaireCollection = dbs.collection("questionnaire");
  let data = await questionnaireCollection.findOne({questionnaireId: parseInt(id)});

  return data;  
};

module.exports.create = async(questionnaireId, data) => {
  console.log("here")
  const questionnaireCollection = dbs.collection("questionnaire");
  let lastRec = await questionnaireCollection.findOne({}, {sort: {"questionnaireId": -1}})
  data.questionnaireId = lastRec.questionnaireId + 1;
  questionnaireCollection.insert([data])

  return data.questionnaireId;
};

module.exports.delete = async(id) => {
  
  const questionnaireCollection = dbs.collection("questionnaire");
  let data = await questionnaireCollection.remove({questionnaireId: parseInt(id)});

  return data;  
};