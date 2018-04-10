const assert = require('assert');
const mongoUtil = require('../mongoUtil.js');

const dbs = mongoUtil.getDb();


module.exports.get = async (id) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  const data = await questionnaireCollection.findOne({ questionnaireId: parseInt(id) });

  return data;
};

module.exports.create = async (questionnaireId, data) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  const lastRec = await questionnaireCollection.findOne({}, { sort: { questionnaireId: -1 } });
  data.questionnaireId = lastRec ? lastRec.questionnaireId + 1 : 1;
  questionnaireCollection.insert([data]);

  return data.questionnaireId;
};

module.exports.update = async (questionnaireId, data) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  data.questionnaireId = parseInt(questionnaireId);
  questionnaireCollection.updateOne(
    { questionnaireId: parseInt(questionnaireId) },
    { $set: data },
    { upsert: true },
  );
  return data.questionnaireId;
};

module.exports.delete = async (id) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  const data = await questionnaireCollection.remove({ questionnaireId: parseInt(id) });

  return data;
};

module.exports.addResult = async (id, data, user) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  // Get quesionnaire data
  const questionnaireRecord = await questionnaireCollection.findOne({ questionnaireId: parseInt(id) });

  // Check if user already answered
  const x = questionnaireRecord.answers.find(answer => answer.user === user);

  if (x) {
    // If user answered update answers
    x.answer = data;
  } else {
    // If no answer add answers
    questionnaireRecord.answers.push({ user, answer: data });
  }
  // Update record
  const questionaireUpdate = await questionnaireCollection.updateOne(
    { _id: questionnaireRecord._id },
    { $set: { answers: questionnaireRecord.answers } },
    { upsert: true },
  );
  return questionaireUpdate;
};

module.exports.switchHidden = async (questionnaireId, value) => {
  const questionnaireCollection = dbs.collection('questionnaire');
  const update = questionnaireCollection.updateOne(
    { questionnaireId: parseInt(questionnaireId) },
    { $set: { hidden: value } },
    { upsert: true },
  );
  return update;
};

