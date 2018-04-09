const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUtil = require('../mongoUtil.js');

const dbs = mongoUtil.getDb();

module.exports.getTeachingClass = async () => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.find({});

  return data ? data.toArray() : [];
};

module.exports.getUsersTeachingClasses = async (userName) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.find({ students: { $in: [userName] } }, { name: 1, _id: 0 });

  return data ? data.toArray() : [];
};

module.exports.getByTeachingClassName = async (name) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.findOne({ name });

  return data;
};

module.exports.getByTeachingClassById = async (classId) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.findOne({ classId });

  return data;
};


module.exports.createTeachingClass = async (name, students) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const lastRec = await teachingClassCollection.findOne({}, { sort: { classId: -1 } });

  classId = lastRec ? lastRec.classId + 1 : 1;

  const data = await teachingClassCollection.insert({
    classId,
    name,
    students,
  });

  return data;
};

module.exports.updateTeachingClass = async (classId, name, students) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.updateOne(
    { classId },
    { $set: { name, students } },
    { upsert: true },
  );
  return data;
};

module.exports.deleteTeachingClass = async (classId) => {
  const teachingClassCollection = dbs.collection('teachingClass');
  const data = await teachingClassCollection.remove({ classId });

  return data;
};
