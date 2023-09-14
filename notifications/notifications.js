const fs = require('fs')
const https = require('https')

const configurationPath = 'config/notifications.json';

let configuration

if (fs.existsSync(configurationPath)) {
    configuration = JSON.parse(
        fs.readFileSync(configurationPath, 'utf8'))
}

exports.notify = function(message) {
    if (configuration) {
        https.request(
            configuration.url,
            {
                method: 'POST'
            },
            response => {
                console.log(response)
            })
            .write(JSON.stringify({
                user: configuration.user,
                token: configuration.token,
                message
            }))
    }
}
