const express = require('express')

const router = express.Router()
const eventLog = []
const clients = new Set()
const maxEventLogSize = 10000
const maxEventSize = 64 * 1024

const eventTypes = {
    beginStroke: 1,
    appendPoint: 2,
    endStroke: 3,
    clear: 4,
    undo: 5
}

router.get('/', function (request, response) {
    response.render('vibe_drawing', {
        title: 'Drawing',
        scripts: ['vibe_drawing.js']
    })
})

router.get('/events', function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })
    response.write('\n')

    const client = response
    clients.add(client)
    eventLog.forEach(event => sendEvent(client, event))

    request.on('close', () => clients.delete(client))
})

router.post('/event', function (request, response) {
    readBinaryRequest(request, response, body => {
        if (!isDrawingEvent(body)) {
            response.status(400)
            response.send()
            return
        }

        const event = {
            clientId: clientIdForRequest(request),
            data: body.toString('base64')
        }
        eventLog.push(event)
        while (eventLog.length > maxEventLogSize) {
            eventLog.shift()
        }
        broadcast(event)
        response.status(204)
        response.send()
    })
})

function readBinaryRequest(request, response, action) {
    let chunks = []
    let length = 0
    let rejected = false

    request.on('data', chunk => {
        if (rejected) {
            return
        }
        length += chunk.length
        if (length > maxEventSize) {
            rejected = true
            response.status(413)
            response.send()
            request.connection.destroy()
            return
        }
        chunks.push(chunk)
    })

    request.on('end', () => {
        if (!rejected) {
            action(Buffer.concat(chunks, length))
        }
    })
}

function isDrawingEvent(body) {
    if (body.length < 1) {
        return false
    }

    switch (body.readUInt8(0)) {
        case eventTypes.beginStroke:
            return body.length === 14
        case eventTypes.appendPoint:
            return body.length === 9
        case eventTypes.endStroke:
            return body.length === 5
        case eventTypes.clear:
        case eventTypes.undo:
            return body.length === 1
        default:
            return false
    }
}

function clientIdForRequest(request) {
    let clientId = request.query.clientId
    if (typeof clientId !== 'string') {
        return ''
    }
    return clientId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
}

function broadcast(event) {
    clients.forEach(client => sendEvent(client, event))
}

function sendEvent(client, event) {
    client.write('event: vibe_drawing-event\n')
    client.write('data: ' + JSON.stringify(event) + '\n\n')
}

module.exports = router
