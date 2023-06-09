const crypto = require("crypto");

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
    // TODO (project) implement actual login
    if (userName === "example_user" && password === 'example_password') {
        // returning example user ID for successful login
        return 1
    }
}
