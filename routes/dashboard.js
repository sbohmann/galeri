let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('dashboard', {
        title: "Dashboard"
    });
})

function readImages() {
    let imageDirectory = 'public/images/c9'
    if (fs.existsSync(imageDirectory)) {
        return fs.readdirSync(imageDirectory)
    } else {
        return []
    }
}

module.exports = router
