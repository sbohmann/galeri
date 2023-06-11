let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('upload', {
        title: "Upload",
        scripts: ["upload.js"]
    })
})

router.post('/', function (request, response) {
    request
        .on('data', data => {
            console.log(data)
        })
        .on('end', () => {
            console.log('end of data')
            response.send()
        })
})

module.exports = router
