const express = require('express')
const router = express.Router()
const implementation = require('../implementation/core.js')

let delayForUserName = new Map()

router.get('/', function (req, res) {
    res.render('login', {
        title: "Login"
    })
})

router.post('/', function (req, res) {
    let userName = req.body.user
    if (!Number.isInteger(delayForUserName.get(userName))) {
        delayForUserName.set(userName, 0)
    }
    let success = (userId) => {
        delayForUserName.set(userName, 0)
        req.session.userId = userId
        res.status(302)
        res.set('Location', '/')
        res.send()
    }
    let failure = () => {
        delayForUserName.set(userName, delayForUserName.get(userName) + 1)
        console.log("Login failed for user [" + userName + "]")
        res.status(302)
        res.set('Location', '/login')
        res.send()
    }
    let loginDelay = delayForUserName.get(userName)
    if (loginDelay > 0) {
        console.log(`Applying login delay of ${loginDelay} seconds for user ${userName}`)
    }
    setTimeout(login,
        1000 * loginDelay,
        userName,
        req.body.password,
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
