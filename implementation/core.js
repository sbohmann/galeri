const crypto = require("crypto");
const loginData = require('./login.js')

exports.configuration = {
    get sessionSecret() {
        // Provide a custom secret for express-session if required
        // In case sessions are preserved across restarts,
        // store and / or reuse this secret.
        // TODO (library) document / link how to retain sessions with express-session
        // It must be a string, hence the use of .toString('hex')
        return crypto.randomBytes(512).toString('hex')
    }
}

exports.login = function(userName, password) {
    const result = loginData.forUserName(userName)
    if (result && result.passwordMatches(password)) {
        return result.userId
    } else {
        return undefined
    }
}
