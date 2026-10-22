export function startUpload(fileList, updateStatus) {
    if (fileList.length === 0) {
        return
    }
    let files = new Array(...fileList)
    let catalog = {
        fileNames: []
    }
    let fileNames = files.map(file => file.name)
    let index = 0
    let names = new Set()
    for (let fileName of fileNames) {
        if (names.has(fileName)) {
            alert("Found duplicate file name [" + fileName + "]")
            return
        }
        names.add(fileName)
        catalog.fileNames.push({
            index: index++,
            name: fileName
        })
    }
    if (catalog.fileNames.length !== files.length) {
        throw new RangeError()
    }
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(catalog)
    }
    fetch("/upload/catalog", options)
        .then(response => {
            if (response.ok) {
                response.text()
                    .then(uploadId => {
                        uploadFiles(files, uploadId)
                    })
            } else {
                updateStatus(`Failed to upload catalog. Server responded with status code ${response.status}`)
            }
        })
        .catch(error => updateStatus(error.toString()))

    function uploadFiles(files, uploadId) {
        let index = 0

        uploadNextFile()

        function uploadNextFile() {
            let fileNumber = `${index + 1} / ${files.length}`
            if (index >= files.length) {
                updateStatus("Successfully uploaded " + files.length + " files.")
                return
            } else {
                updateStatus(`Uploading file ${fileNumber}`)
            }
            let currentIndex = index++
            let file = files[currentIndex]
            let options = {
                method: 'POST',
                body: file
            }
            fetch(`/upload/file/${uploadId}/${currentIndex}`, options)
                .then(response => {
                    if (response.ok) {
                        uploadNextFile()
                    } else {
                        updateStatus(`Error uploading file ${fileNumber}: Server responded with status code ${response.status}`)
                    }
                })
                .catch(error => updateStatus(error.toString()))
        }
    }
}