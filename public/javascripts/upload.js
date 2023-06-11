window.onload = function() {
    const fileSelection = document.getElementById('fileSelection')
    const uploadButton = document.getElementById('uploadButton')

    uploadButton.onclick = function() {
        uploadFile(fileSelection.files)
    }

    function uploadFile(fileList) {
        let files = new Array(...fileList)
        let file = files.pop()
        if (file) {
            let reader = new FileReader()
            reader.onload = () => {
                let options = {
                    method: "POST",
                    body: file
                }
                fetch("/upload", options)
                    .then(() => {
                        alert('Successfully uploaded file of size ' + reader.result.length)
                        uploadFile(files)
                    })
            }
            reader.readAsArrayBuffer(file)
        }
    }
}
