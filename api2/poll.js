const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 1334 });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');

const url = 'mongodb://localhost:27017/data';
const poll = express.Router();
const googleauth = require('simple-google-openid');
const services = require('./services');

module.exports = poll;

const db = require('./poll-MongoDB');
const lessondb = require('./lesson-MongoDB');

poll.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
poll.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));

/** ******** DB Functions *************** */
poll.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  if (id) {
    try {
      const data = await db.get(id);
      const lessons = await services.getAssosiatedLessons(id, 'polls');
      data.lesson = lessons;
      const access = await services.isUserAllowedAccess(req.user.emails[0].value, data);
      if (access) {
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
  if (id) {
    try {
      const data = await db.get(id);
      const access = await services.isUserOwnerOrAdmin(req.user.emails[0].value, data);

      if (access) {
        const deleteStatus = await db.delete(id);
        const removeFromAssosiatedLessons = await services.removeAssosiatedLessons(id, 'polls');
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
  const data = req.body;
  const user = data.user;
  const vote = data.vote;
  const pollId = parseInt(req.params.id);
  const dat = await db.put(pollId, user, vote);

  if (dat) {
    wss.broadcast('-1', pollId, dat); // remove old poll result from all conected ws
    wss.broadcast('1', pollId, data.vote);
  } else {
    wss.broadcast('1', pollId, data.vote);
  }
  res.send(200);
  // res.send("ok")
});

poll.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  if (await services.isUserAdminOrTeacher(req.user.emails[0].value)) {
    const data = req.body;
    const pollId = req.params.id;
    delete data._id;
    const currentPollId = 0;
    if (!data.answers) {
      data.answers = [];
    }
    // Remove any answers not attributed to a user
    const cleanAnswers = data.answers.filter(answer => answer.user !== '');
    data.answers = cleanAnswers || [];

    if (pollId == 'NaN' || pollId == '0' || pollId == 'na') {
      const response = (await db.create(pollId, data)).toString();
      const x = await services.addAssosiatedLessons(data.lesson, 'polls', response.toString(), data.title);
      res.send(response);
    } else {
      const update = await db.update(pollId, data);
      const x = await services.addAssosiatedLessons(data.lesson, 'polls', pollId, data.title);

      res.send('ok');
    }
  } else {
    res.sendStatus(403);
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
