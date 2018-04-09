const bodyParser = require('body-parser');
const assert = require('assert');
const express = require('express');

const teachingClass = express.Router();
const googleauth = require('simple-google-openid');

module.exports = teachingClass;

const db = require('./teachingClass-MongoDB');
const services = require('./services');

teachingClass.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
teachingClass.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));

teachingClass.get('/', async (req, res) => {
  if (await services.isUserAdmin(req.user.emails[0].value)) {
    res.send(await db.getTeachingClass());
  }
});

teachingClass.get('/:className', async (req, res) => {
  if (await services.isUserAdminOrTeacher(req.user.emails[0].value)) {
    res.send(await db.getByTeachingClassName(req.params.className));
  }
});

teachingClass.post('/', bodyParser.json(), async (req, res) => {
  if (await services.isUserAdmin(req.user.emails[0].value)) {
    const data = req.body;
    res.send(await db.createTeachingClass(data.name, data.students));
  }
});


teachingClass.put('/', bodyParser.json(), async (req, res) => {
  const data = req.body;
  if (await services.isUserAdmin(req.user.emails[0].value)) {
    res.send(await db.updateTeachingClass(data.classId, data.name, data.students));
  } else {
    res.sendStatus(203);
  }
});

teachingClass.delete('/:classId', async (req, res) => {
  const classID = req.params.classId;
  if (await services.isUserAdmin(req.user.emails[0].value)) {
    res.send(await db.deleteTeachingClass(classId));
  } else {
    res.sendStatus(203);
  }
});
