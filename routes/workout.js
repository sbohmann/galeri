const express = require('express')
const fs = require("node:fs")
const joda = require('js-joda')

const router = express.Router()

router.get('/', function (request, response) {
    response.render('workout', {
        scripts: ["workout.js"]});
})

router.post('/registerEvent', function (request, response) {
    console.log("Action:", request.body)
    let event = request.body
    try {
        fs.appendFileSync('workout/workout.csv', `${event.type};${event.code};${timestamp()}\n`)
        response
            .status(200)
            .send()
    } catch(error) {
        console.log("Failed to log action")
        response
            .status(500)
            .send()
    }
})

function timestamp() {
    return joda.Instant.now().toString();
}

module.exports = router
