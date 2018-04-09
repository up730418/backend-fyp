const bodyParser = require('body-parser');
const assert = require('assert');
const express = require('express');

const user = express.Router();
const googleauth = require('simple-google-openid');

module.exports = user;
const services = require('./services');
const db = require('./user-MongoDB');

user.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
user.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));


user.get('/', async (req, res) => {
  const userName = req.user.emails[0].value;
  const userType = await services.userRole(userName);

  if (await services.isUserAdmin(userName)) {
    res.send(await db.getUsers());
  } else if (userType === null) {
    db.createUser(req.user.emails[0].value, req.user.name.givenName, req.user.name.familyName, '');
    res.sendStatus(202);
  } else {
    res.sendStatus(203);
  }
});

user.get('/userType', async (req, res) => {
  res.send(await services.userRole(req.user.emails[0].value));
});

user.get('/:userName', async (req, res) => {
  res.send(await db.getByUserName(req.params.userName));
});


user.post('/', bodyParser.json(), async (req, res) => {
  const data = req.body;
  res.send(await db.createUser(data.userName, data.firstName, data.lastName, data.userType));
});


user.put('/', bodyParser.json(), async (req, res) => {
  const data = req.body;
  const admin = await services.isUserAdmin(req.user.emails[0].value);
  if (await services.isUserAdmin(req.user.emails[0].value)) {
    res.send(await db.updateUser(data.userName, data.firstName, data.lastName, data.userType));
  } else {
    res.sendStatus(203);
  }
});

user.delete('/:userName', async (req, res) => {
  const userName = req.user.emails[0].value;

  if (await services.isUserAdmin(userName)) {
    res.send(await db.deleteUser(userName));
  } else {
    res.sendStatus(203);
  }
});
