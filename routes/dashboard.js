const fs = require("fs");
const {LocalTime} = require('js-joda')

let express = require('express')
let router = express.Router()

let tokenForSystem = new Map()

Object.entries(JSON.parse(fs.readFileSync('config/systemTokens.json', 'utf8')))
    .map(entry => {
        let [system, token] = entry
        tokenForSystem.set(system, token)
    })

let stateForSystem = {}

function tokenIsCorrect(systemName, token) {
    let correctToken = tokenForSystem.get(systemName)
    return (correctToken && correctToken.length > 0 && token === correctToken)
}

router.get('/', function (request, response) {
    response.render('dashboard', {
        title: "Dashboard",
        scripts: ["dashboard.js"]
    });
})

router.get('/systems', function (request, response) {
    console.log(stateForSystem)
    response.send(stateForSystem)
})

router.put('/system/:name/report', function (request, response) {
    let systemName = request.params.name
    let token = request.query.token
    if (!tokenIsCorrect(systemName, token)) {
        response.status(401)
        response.send()
        return
    }
    let message = request.body
    stateForSystem[systemName] = {
        state: message.state,
        updated: LocalTime.now(),
        message: message.message
    }
    response.send()
})

router.get('/time', function (request, response) {
    response.send(LocalTime.now())
})

module.exports = router
