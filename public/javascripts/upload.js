window.onload = function() {
    const fileSelection = document.getElementById('fileSelection')
    const uploadButton = document.getElementById('uploadButton')

    uploadButton.onclick = function() {
        for (let file of fileSelection.files) {
            let reader = new FileReader()
            reader.onload = () => {
                console.log(reader.result)
            }
            reader.readAsArrayBuffer(file)
        }
    }
}
