/**
 * Created by Sandeep on 01/06/14.
 */

// Load Our Modules

var express = require('express');
var bodyParser = require('body-parser');
var movies = require('./routes/movies');
var mongoose = require('mongoose');

var app = express();

//connect to our database
//Ideally you will obtain DB details from a config file

var dbName='movieDB';

var connectionString='mongodb://localhost:27017/'+dbName;

mongoose.connect(connectionString);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/api', movies);

module.exports = app;
