const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 1335 });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const services = require('./services');

const googleauth = require('simple-google-openid');

const chat = express.Router();

module.exports = chat;

const db = require('./chat-MongoDB');

chat.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
chat.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));


chat.get('/:id', async (req, res) => {
  const room = req.params.id;
  try {
    //    console.log(req.user)
    res.json(await db.get(room, 50));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

chat.get('/:id', bodyParser.text(), async (req, res) => {
  // NEEDS MORE WORK ON FRONtEND TO HAVE A GO BACK FURTHER IN CHAT THING
  const room = req.params.id;
  const limit = JSON.parse(reuest.body).limit;
  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err, 'unable to connect to Database');
    const chat = db.collection('chat');
    const data = chat.find({ room }).limit(limit).sort({ modifiedTimestamp: -1 }).toArray((err, docs) => {
      assert.equal(err, null);
      const chatData = [];
      for (doc of docs) {
        chatData.push({ message: doc.data, user: doc.user });
      }
      chatData.reverse();
      // client.send(JSON.stringify(chatData))
      res.send(JSON.stringify(chatData));
    });

    db.close();
  });
});

chat.put('/:id', bodyParser.text(), async (req, res) => {
//  console.log(req)
  const data = JSON.parse(req.body).data;
  const user = JSON.parse(req.body).user;
  const room = req.params.id;

  try {
    res.json(await db.put(data, user, room));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    var data = JSON.parse(data);
    const message = data.message;

    switch (data.type) {
      case 'chat':

        if (ws.readyState === 1) {
          db.put(data.message, data.user, data.room);
          //          console.log(data.message, data.user, data.room)
          wss.broadcast(data.message, data.room, data.user);
        }
        break;
    }
  });
  ws.on('close', () => {
    console.log('disconnected');
    ws.terminate();
  });
});

wss.broadcast = function broadcast(message, room, user) {
  wss.clients.forEach((client) => {
    if (room == client.protocol) {
      client.send(JSON.stringify({ data: message, user }));
      // console.log(client.upgradeReq.headers['user-agent'])
    }
  });
};
