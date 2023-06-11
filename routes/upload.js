let express = require('express')
let router = express.Router()

router.get('/', function (request, response) {
    response.render('upload', {
        title: "Upload",
        scripts: ["upload.js"]
    })
})

router.post('/catalog', function (request, response) {
    console.log(request.body)
    response.send()
})

router.post('/file', function (request, response) {
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
