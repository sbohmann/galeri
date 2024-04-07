let express = require('express')
const fs = require("fs");

let router = express.Router()

let notes = []

const dataDirectory = 'data'

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
}

router.get('/', function (request, response) {
    response.render('notes', {
        title: "Notes",
        scripts: ["notes.js"],
        notes: zipWithIndex(notes)
    });
})

function zipWithIndex(input) {
    let result = []
    let index = 0
    for (let element of input) {
        result.push({ index: index++, text: element})
    }
    return result
}

router.post('/post', function (request, response) {
    withText(
        request.body.text,
        rawText => {
            let text = rawText.replace(/[\x00-\x08]/, '')
            notes.unshift(text)
        })
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
