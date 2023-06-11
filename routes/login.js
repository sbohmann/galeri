const express = require('express')
const router = express.Router()
const implementation = require('../implementation/core.js')

let delayForUserName = new Map()

router.get('/', function (request, response) {
    response.render('login', {
        title: "Login"
    })
})

router.post('/', function (request, response) {
    let userName = request.body.user
    if (!Number.isInteger(delayForUserName.get(userName))) {
        delayForUserName.set(userName, 0)
    }
    let success = (userId) => {
        delayForUserName.set(userName, 0)
        request.session.userId = userId
        response.status(302)
        response.set('Location', '/')
        response.send()
    }
    let failure = () => {
        delayForUserName.set(userName, delayForUserName.get(userName) + 1)
        console.log("Login failed for user [" + userName + "]")
        response.status(302)
        response.set('Location', '/login')
        response.send()
    }
    let loginDelay = delayForUserName.get(userName)
    if (loginDelay > 0) {
        console.log(`Applying login delay of ${loginDelay} seconds for user ${userName}`)
    }
    setTimeout(login,
        1000 * loginDelay,
        userName,
        request.body.password,
        success,
        failure)
})

function login(userName, password, success, failure) {
    let userId = implementation.login(userName, password)
    if (userId === undefined) {
        console.log("Login failed for user [" + userName + "]")
        failure()
    } else {
        success(userId)
    }
}

module.exports = router
