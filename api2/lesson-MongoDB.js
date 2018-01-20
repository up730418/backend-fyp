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
    data[type].push({"id" : itemId.toString(), "title": itemTitle.toString()});
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

module.exports.delete = async(id) => {
  
  const lessonCollection = dbs.collection("lesson");
  let data = await lessonCollection.remove({lessonId: parseInt(id)});

  return data;  
};

