const fs = require("fs")
const joda = require("js-joda")

const storagePath = 'workout/workout.csv'

function storage() {
    // const events = parseEvents()

    return {
        add(event) {
            fs.appendFileSync(
                storagePath,
                `${timestamp()};${event.type};${event.code}${specificData(event)}\n`)
        }
    }
}

// function parseEvents() {
//     return fs.readFileSync(storagePath, 'utf8')
//         .split(/\r?\n/)
//         .map(line => line.trim())
//         .filter(line => line.length > 0)
//         .map(line => line.split(/\s*;\s*/))
//         .map(parseEvent)
// }
//
// function parseEvent(csvElements) {
//     let timestamp = joda.Instant.parse(csvElements.pop())
//     let type = csvElements.pop()
//     let code = csvElements.pop()
//     switch(type) {
//         case 'action':
//             return {
//                 timestamp,
//                 type,
//
//             }
//     }
// }

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

module.exports = storage()
