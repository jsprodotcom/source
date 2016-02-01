var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var appIdeas=require('./apis/appIdeas');

var port = process.env.port || 3000;

var app = express();
app.use(bodyParser());
app.use(express.static('.'));

app.get('/', function (request, response) {
    response.sendfile("index.html");
});

app.get('/api/ideas', function(request, response){
    response.send(appIdeas.allIdeas());
});

app.get('/api/ideas/:id', function(request, response){
    response.send(appIdeas.getIdea(request.params.id));
});

//app.listen(port);

module.exports=app;