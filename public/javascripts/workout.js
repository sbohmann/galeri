window.onload = setup

function setup() {
    let activityButtons = document
        .getElementById('activity-buttons')

    let codes = new Set()

    addActivity('LH')
    addActivity('H')
    addActivity('A')
    addActivity('SU')
    addActivity('LS')
    addActivity('BM')
    addActivity('G')
    addMountain('L', 250)
    addMountain('K', 308)
    addMountain('B', 308)
    // addMountain('A') TODO 400?

    function addActivity(code) {
        addCode(code)
        let button = document.createElement('button')
        button.classList.add('activity-button')
        button.textContent = code
        button.onclick = () => registerEvent(button, {code, type: 'action'})
        activityButtons.appendChild(button)
    }

    function addMountain(code, elevation) {
        addCode(code)
        let durationTextField = document.createElement('input')
        durationTextField.type='text'
        let button = document.createElement('button')
        button.classList.add('activity-button')
        button.textContent = code
        button.onclick = () => {
            let durationAsText = durationTextField.value.trim()
            if (/^\d+$/.test(durationAsText)) {
                registerEvent(
                    button,
                    {
                        code,
                        type: 'mountain',
                        elevation,
                        duration: Number.parseInt(durationAsText)
                    })
            } else {
                alert("Please provide duration")
            }
        }
        let paragraph = document.createElement('p')
        paragraph.appendChild(durationTextField)
        paragraph.appendChild(button)
        activityButtons.appendChild(paragraph)
    }

    function addCode(code) {
        if (codes.has(code)) {
            alert(`Duplicate code [${code}]`)
        }
        codes.add(code)
    }

    function registerEvent(button, event) {
        notifyBackend(event)
            .then(response => {
                console.log(response)
                if (response.ok) {
                    button.classList.remove('pending')
                    button.classList.add('success')
                    setTimeout(
                        () => button.classList.remove('success'),
                        3000)
                } else {
                    //console.log(reason)
                    requestFailed(`Response status: ${response.status}`)
                }
            })
            .catch(reason => {
                requestFailed(reason)
            })

        button.classList.add('pending')

        function requestFailed(reason) {
            console.log(`Response failed. Reason: ${reason}`)
            button.classList.remove('pending')
            button.classList.add('error')
            setTimeout(
                () => button.classList.remove('error'),
                3000)
        }
    }

    function notifyBackend(event) {
        return fetch('/workout/registerEvent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            })
    }
}
