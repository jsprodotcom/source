/**
 * Created by Sandeep on 01/06/14.
 */

var app = require('../app');

app.set('port', process.env.PORT || 8000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
