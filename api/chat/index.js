const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 1335});
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');

const chat = express.Router();

module.exports = chat;

const db = require('./chat-MongoDB');


chat.get('/:id(\\w+)', async (req, res) => {
  const room = req.params.id
  try{
    res.json(await db.get(room, 50));
  
  } catch(e) {
    
   console.log(e);
   res.sendStatus(500);
  }
  
  
});

chat.get('/:id(\\w+)', bodyParser.text(), async (req, res) => {
  //NEEDS MORE WORK ON FRONtEND TO HAVE A GO BACK FURTHER IN CHAT THING
  const room = req.params.id
  const limit = JSON.parse(reuest.body).limit
  MongoClient.connect(url, (err, db) =>{
    assert.equal(null, err, "unable to connect to Database")
    const chat = db.collection("chat")
    const data = chat.find({room: room}).limit(limit).sort({"modifiedTimestamp": -1}).toArray((err, docs) =>{
      assert.equal(err, null)
      let chatData = [];
      for(doc of docs){
        chatData.push({message: doc.data, user: doc.user})
      }
      chatData.reverse()
      //client.send(JSON.stringify(chatData))
      res.send(JSON.stringify(chatData))
    })

      db.close()
  })
});

chat.put('/:id(\\w+)', bodyParser.text(), async (req, res) => {
  console.log(req)
  const data = JSON.parse(req.body).data;
  const user = JSON.parse(req.body).user;
  const room = req.params.id;
  
  try{
    
    res.json(await db.put(data, user, room));
  
  } catch(e) {
    
   console.log(e);
   res.sendStatus(500);
  }
  
});

wss.on('connection', function(ws) {
  console.log("Chat Web Socket Connected")
	
  ws.on('message', function(data) {
		var data = JSON.parse(data)
		var message = data.message
        
      switch(data.type) {
          
        case "chat":
          db.put(data.message, data.user, data.room)
          wss.broadcast(data.message, data.room, data.user);
          break;
          
      }
        
	});
});

wss.broadcast = function broadcast(message, room, user){
	wss.clients.forEach(function(client){ 
		if(room == client.protocol){
			client.send(JSON.stringify({data: message, user: user}))
			//console.log(client.upgradeReq.headers['user-agent'])
		}
	});
};