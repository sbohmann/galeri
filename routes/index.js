let express = require('express')
let router = express.Router()
let fs = require('fs')

router.get('/', function(request, response) {
  response.render('index');
})

module.exports = router
