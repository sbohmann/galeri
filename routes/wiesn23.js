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
                let imageFilePath = path.join(imageDirectory, filename);
                let stat = fs.statSync(imageFilePath)
                if (stat.isFile()) {
                    console.log(`[${imageFilePath} is a file`)
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
