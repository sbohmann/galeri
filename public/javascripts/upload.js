import {startUpload} from './fileUpload.js'

window.onload = function () {
    const fileSelection = document.getElementById('fileSelection')
    const uploadButton = document.getElementById('uploadButton')
    const statusLabel = document.getElementById('status')

    uploadButton.onclick = function () {
        startUpload(fileSelection.files, updateStatus)
    }

    function updateStatus(message) {
        statusLabel.textContent = message
    }
}
