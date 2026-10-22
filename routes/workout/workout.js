const express = require('express')

const storage = require('./storage')

const router = express.Router()

router.get('/', function (request, response) {
    response.render('workout', {
        scripts: ["workout.js"]});
})

router.post('/registerEvent', function (request, response) {
    console.log("Action:", request.body)
    let event = request.body
    try {
        storage.add(event)
        response
            .status(200)
            .send()
    } catch(error) {
        console.log("Failed to log action:", error)
        response
            .status(500)
            .send()
    }
})

module.exports = router
