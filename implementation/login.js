const fs = require('fs')

const data = loadLoginData()

function loadLoginData() {
    return JSON.parse(
        fs.readFileSync('config/loginData.json', 'utf8'))
}

exports.forUserName = function (userName) {
    let result = data[userName]
    if (result) {
        return {
            get userId() {
                return result.userId
            },
            passwordMatches(password) {
                return password === result.password
            }
        }
    } else {
        return undefined
    }
}
