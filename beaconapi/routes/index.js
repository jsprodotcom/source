var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Beacon API Demo' });
});

router.post('/log', function(req, res) {
  console.log(req);
});

module.exports = router;
