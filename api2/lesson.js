const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 1337 });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');

const url = 'mongodb://localhost:27017/data';
const lesson = express.Router();
const googleauth = require('simple-google-openid');
const services = require('./services');

module.exports = lesson;

const db = require('./lesson-MongoDB');

lesson.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
lesson.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));


lesson.get('/studentLessons', async (req, res) => {
  const userName = req.user.emails[0].value;
  const userAccess = await services.getUsersTeachingClasses(userName);
  userAccess.push(userName);

  const lessonData = await db.getStudentLessons(userAccess);
  lessonData.push(userAccess);

  res.json(lessonData);
});

lesson.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  const userName = req.user.emails[0].value;
  //  console.log(id)
  if (id) {
    try {
      const data = await db.getById(id);

      if (await services.isUserAllowedAccess(userName, data)) {
        res.json(data);
        // Add  user/Class  Logic
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

lesson.get('/', async (req, res) => {
//  console.log("all")
  res.json(await db.getAll(req.user.emails[0].value));
});

lesson.get('/polls/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  res.json(await db.getPolls(id));
});

lesson.get('/questionnairs/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  res.json(await db.getQuestionnairs(id));
});

lesson.post('/confidence', bodyParser.json(), async (req, res) => {
  const userName = req.user.emails[0].value;
  const level = req.body.level;
  const lessonId = parseInt(req.body.lessonId);

  const x = await (db.saveConfidence(level, lessonId, userName));
  res.send('ok');
});

lesson.post('/endLesson/:id', async (req, res) => {
  const userName = req.user.emails[0].value;
  const lessonId = req.params.id;
  const lesson = await db.getById(lessonId);

  if (services.isUserOwnerOrAdmin(userName, lesson)) {
    const polls = await db.getPolls(lessonId);
    const questionnaires = await db.getQuestionnairs(lessonId);
    const pollIds = [];
    const questionnaireIds = [];
    polls.forEach((poll) => {
      services.switchPoll(poll.pollId, false);
      pollIds.push(poll.pollId);
    });
    db.switchPoll(lessonId, pollIds, false);

    questionnaires.forEach((questionnaire) => {
      services.switchQuestionnaire(questionnaire.questionnaireId, false);
      questionnaireIds.push(questionnaire.questionnaireId);
    });
    db.switchQuestionnaire(lessonId, questionnaireIds, false);
  }
  res.send('ok');
});

lesson.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  if (await services.isUserAdminOrTeacher) {
    const data = req.body;
    const lessonId = req.params.id;
    delete data._id;
    const currentlessonId = 0;

    if (lessonId == 'NaN' || lessonId == '0' || lessonId == 'na') {
      data.confidence = [];
      res.send((await db.create(lessonId, data)).toString());
    } else {
      const update = await db.update(lessonId, data);
      res.send('ok');
    }
  } else {
    res.sendSatus(403);
  }
});

lesson.delete('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  //  console.log(id)
  if (id) {
    try {
      const data = await db.getById(id);

      if (await services.isUserOwnerOrAdmin(req.user.emails[0].value, data)) {
        const deleteStatus = await db.delete(id);
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


/** * Lessons Websockets **** */

wss.on('connection', (ws) => {
  console.log('Lesson Web Socket Connected');
  // console.log(ws.upgradeReq.url);


  ws.on('message', (data) => {
    var data = JSON.parse(data);
    wss.broadcast(data.type, data.lessonId, data.compId);

    switch (data.type) {
      case 'quizSwitch':
        console.log('1');
        db.switchLessonQuestionnaire(data.lessonId, data.compId);
        break;

      case 'pollSwitch':
        console.log('2');
        db.switchLessonPoll(data.lessonId, data.compId);
        break;
    }
  });
});

wss.broadcast = function broadcast(type, lessonId, compId) {
  wss.clients.forEach((client) => {
    if (lessonId == client.protocol) {
      client.send(JSON.stringify({ type, compId }));
    }
  });
};

