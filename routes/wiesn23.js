let express = require('express')
let router = express.Router()
let fs = require('fs')
const path = require("path");
const videoSuffices = ['mov', 'mp4', 'webm']
    .map(suffix => new RegExp('\\.' + suffix + '$'))

router.get('/', function (request, response) {
    response.render('wiesn23', {images: readImages()})
})

function readImages() {
    let imageDirectory = 'public/images/wiesn23'
    if (fs.existsSync(imageDirectory)) {
        return fs.readdirSync(imageDirectory)
            .flatMap(filename => {
                let stat = fs.statSync(path.join(imageDirectory, filename))
                if (stat.isFile) {
                    return [{
                        filename,
                        video: isVideo(filename)
                    }]
                }
                return []
            })
    } else {
        return []
    }
}

function isVideo(filename) {
    for (let suffix of videoSuffices) {
        if (filename.match(suffix)) {
            return true
        }
    }
    return false;
}

module.exports = router
