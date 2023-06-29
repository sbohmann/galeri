let express = require('express')
let router = express.Router()
let fs = require('fs')

router.get('/', function (request, response) {
    response.render('c9', {images: readImages()});
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
