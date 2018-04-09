const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUtil = require( '../mongoUtil.js' );
const dbs = mongoUtil.getDb();

module.exports.getTeachingClass = async() => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.find({});
  
  return data? data.toArray() : [];  ;  
};

module.exports.getUsersTeachingClasses = async(userName) => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.find({"students" : {"$in": [userName]}}, {name: 1, _id: 0});
  
  return data? data.toArray() : [];  ;  
};

module.exports.getByTeachingClassName = async(name) => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.findOne({name: name});

  return data;  
};

module.exports.getByTeachingClassById = async(classId) => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.findOne({classId: classId});

  return data;  
};


module.exports.createTeachingClass = async(name, students) => {
  
  const teachingClassCollection = dbs.collection("teachingClass");
  let lastRec = await teachingClassCollection.findOne({}, {sort: {"classId": -1}})
  
  classId = lastRec? lastRec.classId + 1 : 1;
  
  let data = await teachingClassCollection.insert({classId: classId, name: name, 
                                         students: students});

  return data;
    
};

module.exports.updateTeachingClass = async(classId, name, students) => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.updateOne({classId: classId}, 
                                                {$set: {name: name, students: students }},
                                               {upsert: true});
  return data;
};

module.exports.deleteTeachingClass = async(classId) => {
  const teachingClassCollection = dbs.collection("teachingClass");
  let data = await teachingClassCollection.remove({classId: classId});

  return data;
};