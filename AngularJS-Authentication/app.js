
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var jwt = require('jwt-simple');
var _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('jwtTokenSecret', '123456ABCDEF');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var tokens = [];

function requiresAuthentication(request, response, next) {
    console.log(request.headers);
    if (request.headers.access_token) {
        var token = request.headers.access_token;
        if (_.where(tokens, token).length > 0) {
            var decodedToken = jwt.decode(token, app.get('jwtTokenSecret'));
            if (new Date(decodedToken.expires) > new Date()) {
                next();
                return;
            } else {
                removeFromTokens();
                response.end(401, "Your session is expired");
            }
        }
    }
    response.end(401, "No access token found in the request");
}

function removeFromTokens(token) {
    for (var counter = 0; counter < tokens.length; counter++) {
        if (tokens[counter] === token) {
            tokens.splice(counter, 1);
            break;
        }
    }
}

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(request, response) {
    response.sendfile("Home.html");
});

app.post('/api/login', function(request, response) {
    var userName = request.body.userName;
    var password = request.body.password;

    if (userName === "Ravi" && password === "kiran") {
        var expires = new Date();
        expires.setDate((new Date()).getDate() + 5);
        var token = jwt.encode({
            userName: userName,
            expires: expires
        }, app.get('jwtTokenSecret'));

        tokens.push(token);

        response.send(200, { access_token: token, userName: userName });
    } else {
        response.send(401, "Invalid credentials");
    }
});

app.post('/api/logout', requiresAuthentication, function(request, response) {
    var token= request.headers.access_token;
    removeFromTokens(token);
    response.send(200);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
