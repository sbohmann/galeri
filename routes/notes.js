let express = require('express')

let router = express.Router()

router.get('/', function (request, response) {
    response.render('clock', {
        title: "Clock",
        scripts: ["clock.js"]
    });
})

module.exports = router
