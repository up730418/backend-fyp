const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 1336});
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const lessonService = require('./lessonServices');

const googleauth = require('simple-google-openid');

const questionnaire = express.Router();

module.exports = questionnaire;

const db = require('./questionnaire-MongoDB');

questionnaire.use(googleauth('637021493194-nncq03bpm7am8odjsl69ibceoutch5k4.apps.googleusercontent.com'));
questionnaire.use('*', googleauth.guardMiddleware({ realm: 'jwt' }));


questionnaire.get('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id){
    try{
     const data = await db.get(id);
     const lessons = await lessonService.getAssosiatedLessons(id.toString(), "questionairs");
      
     const user = data.access.find((user) => {
       return user == req.user.emails[0].value;

     });
     const owner = data.owner

     if(user === req.user.emails[0].value || owner === req.user.emails[0].value){
       data.lesson = lessons;
       res.json(data);

      } else {
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

questionnaire.delete('/:id(\\w+)', async (req, res) => {
  const id = parseInt(req.params.id)
  if (id){
    try{
     const data = await db.get(id);

     const owner = data.owner;

      if(owner === req.user.emails[0].value){
        const deleteStatus = await db.delete(id);
        const removeFromAssosiatedLessons = await lessonService.removeAssosiatedLessons(id, "questionnaire");
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

questionnaire.post('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  const data = req.body;
  const questionnaireId = req.params.id;
  delete data["_id"]
  let currentPollId = 0;
  if(questionnaireId == "NaN"){
    
    const response = (await db.create(questionnaireId, data)).toString()
    console.log("woop woop maybe")
    const x = await lessonService.addAssosiatedLessons(data.lesson, "questionairs",response.toString(), data.title);
    console.log(response)
    res.send(response);
    
  }else{
    const update = await db.update(questionnaireId, data);
    console.log("update2")
    const x = await lessonService.addAssosiatedLessons(data.lesson, "questionairs", update.toString(), data.title);
    console.log("update3")
    res.send("ok")
  }
  
});


questionnaire.put('/:id(\\w+)', bodyParser.json(), async (req, res) => {
  const data = req.body;
  const user = data.user;
  const vote = data.vote;
  const questionnaireId = parseInt(req.params.id);
  let dat = await db.put(questionnaireId, user, vote);
  
  res.send(200);
  //res.send("ok")
});