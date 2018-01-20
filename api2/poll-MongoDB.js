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
  
  const pollCollection = dbs.collection("poll");
  let data = await pollCollection.findOne({pollId: parseInt(id)});

  return data;  
};



module.exports.put = async(pollId, user, vote) => {
  const pollCollection = dbs.collection("poll");
  let record = await pollCollection.findOne({pollId: parseInt(pollId)})
  let record3 = await updatePoll(record, pollId, user, vote);
  
  return record3;
};

module.exports.create = async(pollId, data) => {
   const pollCollection = dbs.collection("poll");
  
   let lastRec = await pollCollection.findOne({}, {sort: {"pollId": -1}})
//   console.log("last rec", lastRec.pollId)
   data.pollId = lastRec? lastRec.pollId + 1 : 1;;
   pollCollection.insert([data])
   return data.pollId
};

module.exports.update = async(pollId, data) => {
  const pollCollection = dbs.collection("poll");
  data.pollId = parseInt(pollId)
  pollCollection.updateOne({pollId: parseInt(pollId)}, 
                                          {$set: data},
                                          { upsert: true, });
   return data.pollId
 
};

module.exports.delete = async(id) => {
  
  const pollCollection = dbs.collection("poll");
  let data = await pollCollection.remove({pollId: parseInt(id)});

  return data;  
};


//module.exports.post = async(id, )



function updatePoll(doc, pollId, user, vote) {
  return new Promise(resolve => {
    console.log("1")
    
    const pollCollection = dbs.collection("poll");
      let userAlreadyAnswered = false;
      
    // Search through each item in answer array
      doc.answers.forEach((answer) => { 
        //Remove old answer if user already logged one 
        if(answer.user == user) {
          const oldVote = answer.answer;
          answer.answer = vote;
          
          pollCollection.updateOne({pollId: pollId}, doc, (err, res) => {
            assert.equal(null, err, "unable to update poll");
            console.log("old answer updated");
          })
          userAlreadyAnswered = oldVote;
        }
        
      });
      
      if(!userAlreadyAnswered) {
        doc.answers.push({user: user, answer: vote});
        pollCollection.updateOne({pollId: pollId}, doc, (err, res) => {
          assert.equal(null, err, "unable to update poll");
          console.log("new answer added"); 
      
        });
      }
     resolve(userAlreadyAnswered);
  });
}