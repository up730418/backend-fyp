const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 1334 });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');

const url = 'mongodb://localhost:27017/data';
const poll = express.Router();
const googleauth = require('simple-google-openid');

module.exports = poll;

const db = require('./poll-MongoDB');

poll.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
poll.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));

/** ******** DB Functions *************** */
poll.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  if (id) {
    try {
      const data = await db.get(id);

      const user = data.access.find(user => user == req.user.emails[0].value);
      const owner = data.owner;

      if (user === req.user.emails[0].value || owner === req.user.emails[0].value) {
        data.lesson = [1, 2, 3];
        res.json(data);
      } else {
        res.sendStatus(403);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  } else {
    res.json(null);
  }
});

poll.delete('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  if (id) {
    try {
      const data = await db.get(id);

      const owner = data.owner;

      if (owner === req.user.emails[0].value) {
        const deleteStatus = await db.delete(id);
        console.log(deleteStatus);
        res.sendStatus(202);
      } else {
        res.sendStatus(403);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(500);
  }
});

poll.put('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  console.log(req.body);
  const data = req.body;
  const user = data.user;
  const vote = data.vote;
  const pollId = parseInt(req.params.id);
  const dat = await db.put(pollId, user, vote);

  if (dat) {
    console.log(dat, 'here');
    wss.broadcast('-1', pollId, dat); // remove old poll result from all conected ws
    wss.broadcast('1', pollId, data.vote);
  } else {
    wss.broadcast('1', pollId, data.vote);
  }
  res.send(200);
  // res.send("ok")
});

poll.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  console.log('req');
  const data = req.body;
  console.log('1');
  const pollId = req.params.id;
  delete data._id;
  const currentPollId = 0;
  console.log(pollId);
  if (pollId == 'NaN') {
    res.send((await db.create(pollId, data)).toString());
  } else {
    const update = await db.update(pollId, data);
    res.send('ok');
  }

  // res.send("ok");
});

/** ******** End DB Functions *************** */

/** * Poll Websockets **** */

wss.on('connection', (ws) => {
  console.log('Poll Web Socket Connected');
  // console.log(ws.upgradeReq.url);


  ws.on('message', (data) => {
    var data = JSON.parse(data);
    const message = data.message;

    switch (data.type) {
      case 'poll':
        console.log('poll wss done');
        // console.log(data);

        // addPollResult(data)
        // insertData("poll", {user: data.user, data: data.pollSelection,
        //                    pollId: data.pollId, timeStamp: new Date()});

        // wss.broadcast("1", data.pollId, data.vote);
        break;
    }
  });
});

wss.broadcast = function broadcast(message, room, user) {
  wss.clients.forEach((client) => {
    if (room == client.protocol) {
      client.send(JSON.stringify({ message, user }));
      // console.log(client.upgradeReq.headers['user-agent'])
    }
  });
};
