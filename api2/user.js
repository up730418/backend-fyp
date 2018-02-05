const bodyParser = require('body-parser');
const assert = require('assert');
const express = require('express');
const user = express.Router();
const googleauth = require('simple-google-openid');

module.exports = user;

const db = require('./user-MongoDB');

user.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
user.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));

user.get('/', async (req, res) => {
 const userType = await checkUserType(req.user.emails[0].value)
  
 if(userType === "Admin") {
    res.send(await db.getUsers())
  } else {
    res.sendCode(403);           
  }
})

user.get('/:userName', async (req, res) => {
  res.send(await db.getByUserName(req.params.userName))
})


user.post('/', bodyParser.json(), async(req, res) => {
  const data = req.body
  res.send(await db.createUser(data.userName, data.firstName, data.lastName, data.userType));
})


user.put('/', bodyParser.json(), async(req, res) => {
  const data = req.body
  const userType = await checkUserType(req.user.emails[0].value)
  if(userType === "Admin") {
      res.send(await db.updateUser(data.userName, data.firstName, data.lastName, data.userType));
  } else {
    res.sendCode(403);           
  }
})

user.delete('/:userName', async(req, res) => {
  const userName = req.params.userName
  const userType = await checkUserType(req.user.emails[0].value)
  
  if(userType == "Admin") {
    res.send(await db.deleteUser(userName))
  } else {
    res.sendCode(403); 
  }
  
})


async function checkUserType(userName){
  let user = await db.getByUserName(userName);
  return user.type;
}