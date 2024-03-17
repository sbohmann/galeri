let express = require('express')

let router = express.Router()

router.get('/', function (request, response) {
    response.render('clock', {
        title: "Notes",
        scripts: ["notes.js"]
    });
})

module.exports = router
