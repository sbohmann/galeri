window.onload = function () {
    const fileSelection = document.getElementById('fileSelection')
    const uploadButton = document.getElementById('uploadButton')

    uploadButton.onclick = function () {
        startUpload(fileSelection.files)
    }

    function startUpload(fileList) {
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
                    alert("Failed to upload catalog")
                }
            })
    }

    function uploadFiles(files, uploadId) {
        let index = 0

        uploadFile()

        function uploadFile() {
            if (index >= files.length) {
                alert("Successfully uploaded " + files.length + " files.")
                return
            }
            let fileIndex = index++
            let file = files[fileIndex]
            let options = {
                method: 'POST',
                body: file
            }
            fetch(`/upload/file/${uploadId}/${fileIndex}`, options)
                .then(response => {
                    if (response.ok) {
                        uploadFile(file)
                    }
                })
        }
    }
}
