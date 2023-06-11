let express = require('express')
let router = express.Router()

router.get('/', function(request, response) {
  response.render('upload', {
    title: "Upload",
    scripts: ["upload.js"]
  })
})

module.exports = router
