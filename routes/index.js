let express = require('express')
let router = express.Router()
let fs = require('fs')

router.get('/', function (request, response) {
    response.render('index', {images: readImages()});
})

function readImages() {
    let imageDirectory = 'public/images'
    if (fs.existsSync(imageDirectory)) {
        return fs.readdirSync(imageDirectory)
    } else {
        return []
    }
}

module.exports = router
