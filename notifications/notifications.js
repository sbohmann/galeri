const fs = require('fs')
const https = require('https')

const configurationPath = 'config/notifications.json';

let configuration

if (fs.existsSync(configurationPath)) {
    configuration = JSON.parse(
        fs.readFileSync(configurationPath, 'utf8'))
}

exports.notify = function (message) {
    if (configuration) {
        let buffer = ""
        let body = JSON.stringify({
            user: configuration.user,
            token: configuration.token,
            message
        });
        let request = https.request(
            configuration.url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            response => {
                console.log(response.statusCode, response.statusMessage)
            })
            .on('error', error => console.log("Error while notifying:", error))
            .on('data', block => buffer += block)
            .on('end', () => console.log(buffer))
        request.write(body)
        request.end()
        console.log(body)
    }
}
