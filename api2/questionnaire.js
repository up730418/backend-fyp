const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 1336 });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const services = require('./services');

const googleauth = require('simple-google-openid');

const questionnaire = express.Router();

module.exports = questionnaire;

const db = require('./questionnaire-MongoDB');

questionnaire.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
questionnaire.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));


questionnaire.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  if (id) {
    try {
      const data = await db.get(id);
      const lessons = await services.getAssosiatedLessons(id.toString(), 'questionairs');

      if (await services.isUserAllowedAccess(req.user.emails[0].value, data)) {
        data.lesson = lessons;
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

questionnaire.delete('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id);
  if (id) {
    try {
      if (await services.isUserOwnerOrAdmin(req.user.emails[0].value, data)) {
        const deleteStatus = await db.delete(id);
        const removeFromAssosiatedLessons = await services.removeAssosiatedLessons(id, 'questionnaire');
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

questionnaire.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  if (await services.isUserAdminOrTeacher(req.user.emails[0].value)) {
    const data = req.body;
    const questionnaireId = req.params.id;
    delete data._id;
    const currentPollId = 0;
    if (!data.answers) {
      data.answers = [];
    }
    // Remove any answers not attributed to a user
    const cleanAnswers = data.answers.filter(answer => answer.user !== '');
    data.answers = cleanAnswers || [];

    if (questionnaireId == 'NaN') {
      const response = (await db.create(questionnaireId, data)).toString();
      const x = await services.addAssosiatedLessons(data.lesson, 'questionairs', response.toString(), data.title);
      res.send(response);
    } else {
      const update = await db.update(questionnaireId, data);
      const x = await services.addAssosiatedLessons(data.lesson, 'questionairs', update.toString(), data.title);
      res.send('ok');
    }
  } else {
    res.sendStatus(403);
  }
});


questionnaire.put('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  const data = req.body;

  const questionnaireId = parseInt(req.params.id);
  const dat = await db.addResult(questionnaireId, data, req.user.emails[0].value);

  res.sendStatus(200);
  // res.send("ok")
});
