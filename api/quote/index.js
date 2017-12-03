const WebSocketServer = require('ws').Server;
//const wss = new WebSocketServer({port: 1334});
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');

const quote = express.Router();

module.exports = quote;