import {startUpload} from "./fileUpload.js";

window.onload = init

function init() {
    const fileSelection = document.getElementById('fileSelection')
    const fileUploadButton = document.getElementById('fileUploadButton')
    const statusLabel = document.getElementById('status')

    fileUploadButton.onclick = function () {
        startUpload(
            fileSelection.files,
            message => statusLabel.textContent = message)
    }

    for (let button of document.getElementsByClassName("copy-button")) {
        button.onclick = () => {
            copy(button.dataset.nodeindex)
        }
    }

    document
        .getElementById("text-input")
        .focus()
}

export function copy(index) {
    let container = document.getElementById('note_' + index)
    if (!container) {
        alert("No element found for index " + index)
        return
    }
    let text = container.textContent
    navigator.clipboard
        .writeText(text)
}
