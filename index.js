const express = require('express');
const ejs = require('ejs').renderFile
const app = express();
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);
app.use('/api/poll', require('./api/poll'));
app.use('/api/quote', require('./api/quote'));
app.use('/api/chat', require('./api/chat'));

//app.use(express.static('poll', {extensions: ['html']}));
//app.use(express.static('quote', {extensions: ['html']}));
//app.use(express.static('chat', {extensions: ['html']}));
//app.use(express.static('angular', {extensions: ['html']}));
//app.set('view engine', 'html');
//app.engine('html', ejs);
//app.set('view engine', 'html');

const port = process.env.port || 8080;

app.listen(port, (err) => {
  if(err){
    console.log('error', err);
  
  } else {
    console.log(`app listening on port ${port}`)
  
  }
  
});
