const {LocalTime} = require('js-joda')

let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('dashboard', {
        title: "Dashboard",
        scripts: ["dashboard.js"]
    });
})

router.get('/systems', function (request, response) {
    response.send({
        "alamera": {
            status: 'OK',
            statusDate: LocalTime.now()
        }
    })
})

router.get('/time', function (request, response) {
    response.send(LocalTime.now())
})

module.exports = router
