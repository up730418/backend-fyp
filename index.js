const express = require('express');

const app = express();
const port = process.env.port || 8080;
const path = require('path');
const mongoUtil = require('./mongoUtil');

// connectMongoDb
mongoUtil.connectToServer((err) => {
  if (err) {
    console.error('Database Error');
  } else {
    const allowCrossDomain = function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      // intercept OPTIONS method
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    };
    app.locals.db = 'foo';
    app.use(allowCrossDomain);
    app.use('/api/poll', require('./api/poll.js'));
    app.use('/api/chat', require('./api/chat.js'));
    app.use('/api/lesson', require('./api/lesson.js'));
    app.use('/api/questionnaire', require('./api/questionnaire.js'));
    app.use('/api/user', require('./api/user.js'));
    app.use('/api/teachingClass', require('./api/teachingClass.js'));


    app.use(express.static(path.join(__dirname, 'angular')));

    // If route dosent exist redirect to angular app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'angular/index.html'));
    });


    app.listen(port, (err) => {
      if (err) {
        console.error('error', err);
      } else {
        console.error(`app listening on port ${port}`);
      }
    });
  }
});
