window.onload = init

function init() {
    const imageSelection = document.getElementById('imageSelection')
    const imageUploadButton = document.getElementById('imageUploadButton')

    imageUploadButton.onclick = function () {
        startUpload(imageSelection.files)
    }

    document
        .getElementById("text-input")
        .focus()
}

function copy(index) {
    let container = document.getElementById('note_' + index)
    if (!container) {
        alert("No element found for index " + index)
        return
    }
    let text = container.textContent
    navigator.clipboard
        .writeText(text)
        .then(() => alert("Copied text [" + text + "]"))
}
