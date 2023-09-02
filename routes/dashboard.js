const {LocalTime} = require('js-joda')

let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('dashboard', {
        title: "Dashboard",
        scripts: ["dashboard.js"],
        systems: ['alamera']
    });
})

router.get('/system/:system/state', function (request, response) {
    if (request.params.system) {
        response.send("OK");
    } else {
        response.send("unknown");
    }
})

router.get('/time', function (request, response) {
    response.send(LocalTime.now())
})

function readImages() {
    let imageDirectory = 'public/images/c9'
    if (fs.existsSync(imageDirectory)) {
        return fs.readdirSync(imageDirectory)
    } else {
        return []
    }
}

module.exports = router
