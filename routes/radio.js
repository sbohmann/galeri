let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('radio', {
        title: "Radio",
        scripts: ["radio.js"]
    });
})

module.exports = router
