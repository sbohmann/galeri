const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const uploadForId = new Map()

router.get('/', function (request, response) {
    response.render('upload', {
        title: "Upload",
        scripts: ["upload.js"]
    })
})

router.post('/catalog', function (request, response) {
    let catalog = request.body
    let upload = createUpload(catalog)
    response.send(upload.id)
})

function createUpload(catalog) {
    let id = createUploadId()
    let upload = {
        id,
        catalog
    }
    uploadForId.set(id, upload)
    return upload
}

function createUploadId() {
    let id = Date.now()
    if (uploadForId.has(id)) {
        throw new RangeError("Duplicate upload ID")
    }
    return id.toString()
}

router.post('/file/:uploadId/:fileIndex', function (request, response) {
    let uploadId = request.params.uploadId
    let fileIndex = Number(request.params.fileIndex)
    let upload = uploadForId.get(uploadId)
    if (!upload) {
        throw new RangeError("Unknown upload ID: " + uploadId)
    }
    if (!Number.isInteger(fileIndex) || fileIndex < 0 || fileIndex >= upload.catalog.fileNames.length) {
        throw new RangeError(`File index [${fileIndex}] out of range for upload [${uploadId}] ` +
            `with catalog size [${upload.catalog.fileNames.length}]`)
    }
    let fileEntry = upload.catalog.fileNames[fileIndex]
    if (fileEntry.index !== fileIndex) {
        throw new RangeError()
    }
    let uploadDirectory = path.join('uploads', uploadId)
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory)
    }
    let fileStream = fs.createWriteStream(path.join(uploadDirectory, fileEntry.name))
    request.pipe(fileStream)
    request.on('end', () => {
            console.log('end of data')
            response.send()
        })
})

module.exports = router
