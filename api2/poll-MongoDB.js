const url = 'mongodb://localhost:27017/data';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUtil = require('../mongoUtil.js');

const dbs = mongoUtil.getDb();

module.exports.get = async (id) => {
  const pollCollection = dbs.collection('poll');
  const data = await pollCollection.findOne({ pollId: parseInt(id) });

  return data;
};


module.exports.put = async (pollId, user, vote) => {
  const pollCollection = dbs.collection('poll');
  const record = await pollCollection.findOne({ pollId: parseInt(pollId) });
  const record3 = await updatePoll(record, pollId, user, vote);

  return record3;
};

module.exports.create = async (pollId, data) => {
  const pollCollection = dbs.collection('poll');

  const lastRec = await pollCollection.findOne({}, { sort: { pollId: -1 } });
  //   console.log("last rec", lastRec.pollId)
  data.pollId = lastRec ? lastRec.pollId + 1 : 1;
  pollCollection.insert([data]);
  return data.pollId;
};

module.exports.update = async (pollId, data) => {
  const pollCollection = dbs.collection('poll');
  data.pollId = parseInt(pollId);
  pollCollection.updateOne(
    { pollId: parseInt(pollId) },
    { $set: data },
    { upsert: true },
  );
  return data.pollId;
};

module.exports.switchHidden = async (pollId, value) => {
  const pollCollection = dbs.collection('poll');
  console.log('switc1');
  const update = pollCollection.updateOne(
    { pollId: parseInt(pollId) },
    { $set: { hidden: value } },
    { upsert: true },
  );
  console.log('switc2');
  return update;
};

module.exports.delete = async (id) => {
  const pollCollection = dbs.collection('poll');
  const data = await pollCollection.remove({ pollId: parseInt(id) });

  return data;
};


// module.exports.post = async(id, )


function updatePoll(doc, pollId, user, vote) {
  return new Promise((resolve) => {
    console.log('1');

    const pollCollection = dbs.collection('poll');
    let userAlreadyAnswered = false;

    // Search through each item in answer array
    doc.answers.forEach((answer) => {
      // Remove old answer if user already logged one
      if (answer.user == user) {
        const oldVote = answer.answer;
        answer.answer = vote;

        pollCollection.updateOne({ pollId }, doc, (err, res) => {
          assert.equal(null, err, 'unable to update poll');
          console.log('old answer updated');
        });
        userAlreadyAnswered = oldVote;
      }
    });

    if (!userAlreadyAnswered) {
      doc.answers.push({ user, answer: vote });
      pollCollection.updateOne({ pollId }, doc, (err, res) => {
        assert.equal(null, err, 'unable to update poll');
        console.log('new answer added');
      });
    }
    resolve(userAlreadyAnswered);
  });
}
