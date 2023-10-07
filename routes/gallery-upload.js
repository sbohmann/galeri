const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

router.get('/', function (request, response) {
    response.render('gallery-upload', {
        title: "Gallery Upload",
        scripts: ["gallery-upload.js"]
    })
})

module.exports = router
