let express = require('express')
let router = express.Router()
let fs = require('fs')

router.get('/', function (request, response) {
    response.render('wiesn23', {images: readImages()});
})

function readImages() {
    let imageDirectory = 'public/images/wiesn23'
    if (fs.existsSync(imageDirectory)) {
        return fs.readdirSync(imageDirectory)
    } else {
        return []
    }
}

module.exports = router
