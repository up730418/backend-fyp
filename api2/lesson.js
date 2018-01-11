const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const url = 'mongodb://localhost:27017/data';
const lesson = express.Router();
const googleauth = require('simple-google-openid');

module.exports = lesson;

const db = require('./lesson-MongoDB');

lesson.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
lesson.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));

lesson.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id)
//  console.log(id)
  if (id){
    try{
     const data = await db.getById(id);

     const user = data.access.find((user) => {
       return user == req.user.emails[0].value;

     });
    const owner = data.owner

      if(user === req.user.emails[0].value || owner === req.user.emails[0].value){
        res.json(data);

      }else {
        res.sendStatus(403)
      }


    } catch(e) {

     console.log(e);
     res.sendStatus(500);
    }
    
  } else {
    res.json(null)
  }
  
});

lesson.get('/', async (req, res) => { 
//  console.log("all")
  res.json( await db.getAll(req.user.emails[0].value) );
});

lesson.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
//  console.log("herere")
  const data = req.body;
  const lessonId = req.params.id;
  delete data["_id"]
  let currentPollId = 0;
//  console.log(lessonId)
  if(lessonId == "NaN" || lessonId == "0" || lessonId == "na" ){
    res.send( (await db.create(lessonId, data)).toString());
  
  }else{
    const update = await db.update(lessonId, data);
    res.send("ok")
  }
  
});

lesson.delete('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id)
//  console.log(id)
  if (id){
    try{
     const data = await db.getById(id);

     const owner = data.owner;

      if(owner === req.user.emails[0].value){
        const deleteStatus = await db.delete(id);
//        console.log(deleteStatus);
        res.sendStatus(202);

      }else {
        res.sendStatus(403);
      }


    } catch(e) {

     console.log(e);
     res.sendStatus(500);
    }
    
  } else {
    res.sendStatus(500);
  }
  
});

