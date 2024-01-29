const fs = require("fs");
const {LocalTime, Instant} = require('js-joda')
const {notify} = require('../notifications/notifications.js')

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
    if (!correctToken || correctToken.length === 0) {
        console.log("Missing or empty token for system name", systemName)
        return false
    }
    if (token !== correctToken) {
        console.log("Token mismatch for system name", systemName)
        return false
    }
    return true
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
        response.send("Missing or incorrect token")
        return
    }
    try {
        request.body
        if (!request.body.state) {
            console.log("Request body missing state value:", request.body)
            response.status(400)
            response.send()
            return
        }
        let systemState = request.body.state;
        stateForSystem[systemName] = {
            state: systemState,
            updated: LocalTime.now(),
            updateInstant: Instant.now(),
            message: request.body.message
        }
        if (systemState !== 'OK') {
            notify("System [" + systemName + "] state: " + systemState)
        }
    } catch (error) {
        console.log(error)
        response.status(500)
    }
    response.end()
})

const count = (() => {
    let countValues = new Map()
    return {
        check(system) {
            let value = countValues.get(system)
            if (value === undefined) {
                value = 0
            } else {
                value += 1
                value %= 15
            }
            countValues.set(system, value)
            console.log(`${system} - value: ` + value)
            return (value === 0)
        },
        reset(system) {
            countValues.delete(system)
        }
    }
})()

setInterval(checkStates, 60_000)

function checkStates() {
    for (let systemName in stateForSystem) {
        let state = stateForSystem[systemName]
        if (Instant.now().isAfter(state.updateInstant.plusSeconds(720))) {
            if (count.check(systemName)) {
                console.log(`Notifying ${systemName}`)
                notify(`System [${systemName}] state older than 12 minutes`)
            } else {
                console.log(`Not notifying ${systemName}`)
            }
        } else {
            count.reset(systemName)
        }
    }
}

module.exports = router
