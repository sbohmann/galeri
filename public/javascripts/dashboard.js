window.onload = initialize

function initialize() {
    let systemsView = document.getElementById('systems')
    let timeLabel = document.getElementById('timelabel')
    timeLabel.textContent = '...'

    function update() {
        fetch('/dashboard/time')
            .then(response => response.text()
                .then(text => timeLabel.textContent = text))
        fetch('/dashboard/systems')
            .then(response => response.json()
                .then(systems => {
                    for (let systemName of Object.keys(systems)) {
                        let system = systems[systemName]
                        let systemViewId = 'system_' + systemName; //TODO normalize system name
                        let systemStatusLabelId = 'system_' + systemName + '_status';
                        let systemView = document.getElementById(systemViewId)
                        let systemStatusLabel
                        if (systemView) {
                            systemStatusLabel = document.getElementById(systemStatusLabelId)
                        } else {
                            let systemsView = document.getElementById('systems')
                            systemView = document.createElement('div')
                            systemView.id = systemViewId
                            let systemNameLabel = document.createElement('h3')
                            systemNameLabel.textContent = systemName
                            systemView.appendChild(systemNameLabel)
                            systemStatusLabel = document.createElement('h1')
                            systemStatusLabel.id = systemStatusLabelId
                            systemView.appendChild(systemStatusLabel)
                            systemsView.appendChild(systemView)
                        }
                        systemStatusLabel.textContent = system.status
                        if (system.status === 'OK') {
                            systemStatusLabel.classList.remove('red')
                            systemStatusLabel.classList.add('green')
                        } else {
                            systemStatusLabel.classList.remove('green')
                            systemStatusLabel.classList.add('red')
                        }
                    }
                }))
    }

    setInterval(update, 5000)
    update()
}
