window.onload = initialize

function initialize() {
    let timeLabel = document.getElementById('timelabel')
    let timeLabelText = document.createTextNode("...")
    timeLabel.appendChild(timeLabelText)

    function update() {
        fetch('/dashboard/time')
            .then(response => response.text()
                .then(text => timeLabelText.textContent = text))
    }

    setInterval(update, 5000)
    update()
}
