let express = require('express')

let router = express.Router()

let notes = []

router.get('/', function (request, response) {
    response.render('notes', {
        title: "Notes",
        scripts: ["notes.js"],
        notes
    });
})

router.post('/post', function (request, response) {
    withText(
        request.body.text,
        text => notes.unshift(text))
    response.status(302)
    response.set('Location', '/notes')
    response.send()
})

function withText(value, action) {
    if (value === undefined) {
        return
    }
    value = value.trim()
    if (value.length > 0) {
        action(value)
    }
}

module.exports = router
