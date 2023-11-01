const express = require('express')
const fs = require('fs')
const path = require("path");

const videoSuffices = ['mov', 'mp4', 'webm']
    .map(suffix => new RegExp('\\.' + suffix + '$'))

function buildRouter(name) {
    let router = express.Router()

    router.get('/', function (request, response) {
        response.render(name, {images: readImages()})
    })

    function readImages() {
        let imageDirectory = 'public/images/' + name
        if (fs.existsSync(imageDirectory)) {
            return fs.readdirSync(imageDirectory)
                .flatMap(filename => {
                    let imageFilePath = path.join(imageDirectory, filename);
                    let stat = fs.statSync(imageFilePath)
                    if (stat.isFile()) {
                        console.log(`[${imageFilePath}] is a file`)
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

    return router
}

module.exports = buildRouter
