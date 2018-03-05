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

module.exports.getByIds = async(ids) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.find({lessonId: {"$in": ids}});

  return data? data.toArray() : [];  
};


module.exports.getAll = async(owner) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.find({owner: owner});

  return data.toArray();  
};

module.exports.getStudentLessons = async(user) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.find({access: {"$in": user}});

  return data.toArray();  
};

module.exports.getPolls = async(id) => {

  let polls = []
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({lessonId: parseInt(id)});

  data.polls.forEach(poll => {
    polls.push({pollId: parseInt(poll.id)})
  })
  
  let pollQuerry = {"$or": polls}
  
  const pollCollection = dbs.collection("poll");
  let pollData = await pollCollection.find(pollQuerry);
  return pollData? pollData.toArray() : [];  
};

module.exports.getQuestionnairs = async(id) => {
  let questionnaires = []
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({lessonId: parseInt(id)});

  data.questionairs.forEach(questionnaire => {
    
    questionnaires.push({questionnaireId: parseInt(questionnaire.id)})
  })
  
  let questionnaireQuerry = {"$or": questionnaires}
  
  const questionnaireCollection = dbs.collection("questionnaire");
  let questionnaireData = await questionnaireCollection.find(questionnaireQuerry);
  return questionnaireData? questionnaireData.toArray(): [];  
};

module.exports.getRelatedData = async(id, type) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data;
  
  switch(type) {
    case "poll":
      data = await lessonCollection.find({"polls" : {"$elemMatch": {"id": id.toString()}}}, {"lessonId": 1, "_id" : 0 });
      break;
      
    case "chat":
      data = await lessonCollection.find({"chats" : {"$elemMatch": {"id": id.toString()}}}, {"lessonId": 1});
      break;
      
    case "questionairs":
      data = await lessonCollection.find({"questionairs" : {"$elemMatch": {"id": id.toString()}}}, {"lessonId": 1});
      break;
  }
  
  return data? data.toArray() : [];  
};

module.exports.updateRelatedItem = async(lessonId, type, itemId, itemTitle) => {
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  
  item = data[type].find(item => item.id == itemId.toString())

  if(item){
    item.title = itemTitle;
    
  } else {
    data[type].push({"id" : itemId.toString(), "title": itemTitle.toString(), "hidden" : true });
  }
  
  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  
  return update;  
};

module.exports.deleteRelatedItem = async(lessonId, type, itemId) => {
  console.log("deleting")
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  
  
  removeItem = data[type].filter(item => item.id !== itemId.toString())
  
  data[type] = removeItem;
  
  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  
  return update;  
};

module.exports.create = async(lessonId, data) => {
   const lessonCollection = dbs.collection("lesson");
   let lastRec = await lessonCollection.findOne({}, {sort: {"lessonId": -1}})
//   console.log("last rec", lastRec.lessonId)
   data.lessonId = lastRec? lastRec.lessonId + 1 : 1;
   lessonCollection.insert([data])
   return data.lessonId
};

module.exports.update = async(lessonId, data) => {
   const lessonCollection = dbs.collection("lesson");
   lessonCollection.updateOne({lessonId: parseInt(lessonId)}, 
                                          {$set: data},
                                          { upsert: true, });
   return data.lessonId
 
};

module.exports.saveConfidence = async(level, lessonId, userName) => {
  const lessonCollection = dbs.collection("lesson");
  //   const data = await lessonCollection.findOneAndUpdate({"lessonId": lessonId},
  //                                             {$set: {"confidence": {"userName": userName,  "level": level}}},
  //                                             {upsert: true})
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
//  data.confidence = []
  item = data.confidence.find(item => item.userName == userName)

  if(item) {
    item.level = level;
  } else {
    data.confidence.push({userName: userName, level: level})
  }

  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  return update;
  return userAnswered;
   
}

module.exports.switchPoll = async(lessonId, pollIds, visibility) => {
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  pollIds.forEach((pollId) => {
    item = data.polls.find(item => item.id == pollId.toString())
    item.hidden = visibility;
    console.log(item)
  })  
  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  return update;
}

module.exports.switchQuestionnaire = async(lessonId, questionnaireIds, visibility) =>{
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  questionnaireIds.forEach((questionnaireId) => {
    item = data.questionairs.find(item => item.id == questionnaireId.toString())
    item.hidden = visibility;
    console.log(item)
  })
  
  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  
  return update;
}
module.exports.switchLessonPoll = async(lessonId, pollId, visibility) => {
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  item = data.polls.find(item => item.id == pollId.toString())
  
  if(visibility) {
    item.hidden = visibility;
  } else {
    item.hidden = item.hidden? !item.hidden : true 
  }

  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  return update;
}

module.exports.switchLessonQuestionnaire = async(lessonId, questionnaireId, visibility) => {
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.findOne({"lessonId": parseInt(lessonId)}); 
  item = data.questionairs.find(item => item.id == questionnaireId.toString())
  
  if(visibility) {
    item.hidden = visibility;
  } else {
    item.hidden = item.hidden? !item.hidden : true 
  }
  
  let update = await lessonCollection.updateOne({"_id": data._id}, data);
  
  return update;
}

module.exports.delete = async(id) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.remove({lessonId: parseInt(id)});

  return data;  
};

