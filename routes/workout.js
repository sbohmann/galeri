const express = require('express')
const fs = require("fs")
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
        fs.appendFileSync(
            'workout/workout.csv',
            `${timestamp()};${event.type};${event.code}${specificData(event)}\n`)
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

function specificData(event) {
    switch (event.type) {
        case 'mountain':
            return `;${event.elevation};${event.duration}`
        default:
            return ''
    }
}

function timestamp() {
    return joda.Instant.now().toString();
}

module.exports = router
