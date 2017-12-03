const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 1334});
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const url = 'mongodb://localhost:27017/data';
const poll = express.Router();

module.exports = poll;

const db = require('./poll-MongoDB');

/********** DB Functions ****************/
poll.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id)
  console.log("here")
  try{
    res.json(await db.get(id));
  
  } catch(e) {
    
   console.log(e);
   res.sendStatus(500);
  }
  
});

poll.put('/:id(\\w+)', bodyParser.text(), async (req, res) => {
  console.log(req.body)
  const data = JSON.parse(req.body);
  const user = data.user;
  const vote = data.vote;
  const pollId = parseInt(req.params.id);
  let dat = await db.put(pollId, user, vote);
  console.log("1", dat)
  if(dat) {
    console.log(dat, "here")
    wss.broadcast( "-1", pollId, dat); //remove old poll result from all conected ws
    wss.broadcast("1", pollId, data.vote);

  } else {
    wss.broadcast("1", pollId, data.vote)

  }
  res.send(200);
  res.send("ok")
});

poll.post('/:id(\\w+)', bodyParser.text(), async (req, res) => {
  console.log("req")
  const data = JSON.parse(req.body);
  console.log("1")
  const pollId = req.params.id;
  delete data["_id"]
  let currentPollId = 0;
  console.log(pollId)
  if(pollId == "NaN"){
  console.log("2")
    res.send( (await db.post(pollId, data)).toString());
//    
//    MongoClient.connect(url, (err, db) =>{
//        assert.equal(null, err, "unable to connect to Database");
//        const poll = db.collection("poll");
//      
//        const collection = await poll.findOne({}, {sort: {"pollId": 1}}
//                                              assert.equal(err, null, "poll error creating");
//          currentPollId = parseInt(doc.pollId) + 1;
//          console.log(currentPollId)
//        })
//        data.pollId = currentPollId.toString();
//        poll.insert([data], (err, result) => {
//          assert.equal(err, null, "unable to input result");
//      });
//      db.close();
//    });
//    
  }else{
  console.log("3")
    MongoClient.connect(url, (err, db) =>{
      console.log("4")
       data.pollId = parseInt(pollId)
        assert.equal(null, err, "unable to connect to Database");
        const poll = db.collection("poll");
        
        const collection = poll.updateOne({pollId: parseInt(pollId)}, 
                                          {$set: data},
                                          { upsert: true, },
                                           (err, res) => {
            assert.equal(null, err, "unable to update poll");
            console.log("poll updated");
          })
        db.close();
    });
  }
  
    res.send("ok");
});

/********** End DB Functions ****************/

/*** Poll Websockets *****/

wss.on('connection', function(ws) {
	console.log("Poll Web Socket Connected")
    //console.log(ws.upgradeReq.url);
  
	
  ws.on('message', function(data) {
		var data = JSON.parse(data)
		var message = data.message
        
      switch(data.type) {
          
        case "poll":
          console.log("poll wss done");
          //console.log(data);
          
          //addPollResult(data)
         // insertData("poll", {user: data.user, data: data.pollSelection, 
          //                    pollId: data.pollId, timeStamp: new Date()});
          
         // wss.broadcast("1", data.pollId, data.vote);
          break;
          
      }
        
	});
});

wss.broadcast = function broadcast(message, room, user){
	wss.clients.forEach(function(client){ 
		if(room == client.protocol){
			client.send(JSON.stringify({message: message, user: user}))
			//console.log(client.upgradeReq.headers['user-agent'])
		}
	});
};
