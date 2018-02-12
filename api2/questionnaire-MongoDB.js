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
  const questionnaireCollection = dbs.collection("questionnaire");
  let lastRec = await questionnaireCollection.findOne({}, {sort: {"questionnaireId": -1}})
  data.questionnaireId = lastRec? lastRec.questionnaireId + 1 : 1;
  questionnaireCollection.insert([data])

  return data.questionnaireId;
};

module.exports.update = async(questionnaireId, data) => {
  console.log("update")
  console.log(data)
  const questionnaireCollection = dbs.collection("questionnaire");
  data.questionnaireId = parseInt(questionnaireId)
  questionnaireCollection.updateOne({questionnaireId: parseInt(questionnaireId)}, 
                                          {$set: data},
                                          { upsert: true, });
   return data.questionnaireId
};

module.exports.delete = async(id) => {
  
  const questionnaireCollection = dbs.collection("questionnaire");
  let data = await questionnaireCollection.remove({questionnaireId: parseInt(id)});

  return data;  
};

module.exports.addResult = async(id, data, user) => {
  
  const questionnaireCollection = dbs.collection("questionnaire");
  //Get quesionnaire data
  let questionnaireRecord = await questionnaireCollection.findOne({questionnaireId: parseInt(id)});
  
  //Check if user already answered
  let x = questionnaireRecord.answers.find(answer => answer.user === user)
  
  if(x){
    //If user answered update answers
    x.answer = data
  } else {
    //If no answer add answers
    questionnaireRecord.answers.push({user: user, answer: data})
  }
  //Update record
  let questionaireUpdate = await questionnaireCollection.updateOne({_id: questionnaireRecord["_id"] }, 
                                          {$set: questionnaireRecord},
                                          { upsert: true, });
  return questionaireUpdate;  
};

