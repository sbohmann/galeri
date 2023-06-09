let express = require('express');
let router = express.Router();
let fs = require('fs')

router.get('/', function(req, res, next) {
  res.render('index', { images: readImages() });
});

function readImages() {
  return fs.readdirSync('public/images')
}

module.exports = router;