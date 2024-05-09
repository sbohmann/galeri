let express = require('express')
const fs = require("fs");
const path = require("path");

let router = express.Router()

let notes = []

const dataDirectory = 'data'
const dataFile = path.join(dataDirectory, 'notes')
const imageDirectory = path.join(dataDirectory, 'images')
const thumbnailDirectory = path.join(dataDirectory, 'images')

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
}

if (fs.existsSync(dataFile)) {
    // TODO parse the file properly and more efficiently
    fs.readFileSync(dataFile, 'utf8')
        .split(/\x02|\x02\x03|\x03/)
        .filter(text => text.length > 0)
        .map(parseNote)
        .forEach(text => notes.unshift(text))
}

function parseNote(text) {
    let match = text.match(/^\x01(\w+)\x00(.*)$/)
    if (match) {
        let type = match[1]
        let content = match[2]
        return parseStructuredNote(type, content)
    }
    return text
}

function parseStructuredNote(type, content) {
    switch(type) {
        case 'img':
            return {
                type,
                name: content,
                fileExtension: fileExtensionForPath(content)
            }
        default:
            return {
                type,
                text: content
            }
    }
}

function fileExtensionForPath(path) {
    let match = path.match(/^.*\.([^.]+)$/)
    if (match) {
        return match[1]
    } else {
        return ''
    }
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
        result.push({ index: index++, content: element})
    }
    return result
}

router.post('/post', function (request, response) {
    withText(
        request.body.text,
        rawText => {
            let text = rawText.replace(/[\x00-\x08]/, '')
            if (text.length > 0) {
                notes.unshift(text)
                saveNote(text)
            }
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

function saveNote(text) {
    fs.appendFileSync(dataFile, `\x02${text}\x03`, 'utf8')
}

module.exports = router
