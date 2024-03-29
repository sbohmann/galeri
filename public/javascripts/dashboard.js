window.onload = initialize

function initialize() {
    let systemsView = document.getElementById('systems')
    let displayedSystemNames = new Set()

    function update() {
        fetch('/dashboard/systems')
            .then(response => response.json()
                .then(systems => {
                    let newSystemNames = new Set()
                    for (let systemName of Object.keys(systems)) {
                        displayedSystemNames.add(systemName)
                        newSystemNames.add(systemName)
                        let system = systems[systemName]
                        let systemViewId = 'system_' + systemName; //TODO normalize system name
                        let systemStatusLabelId = 'system_' + systemName + '_status';
                        let systemStatusUpdatedLabelId = 'system_' + systemName + '_status_update';
                        let systemView = document.getElementById(systemViewId)
                        let systemStatusLabel
                        let systemStatusUpdatedLabel
                        if (systemView) {
                            systemStatusLabel = document.getElementById(systemStatusLabelId)
                            systemStatusUpdatedLabel = document.getElementById(systemStatusUpdatedLabelId)
                        } else {
                            systemView = document.createElement('div')
                            systemView.id = systemViewId
                            systemView.classList.add('system_view')
                            let systemNameLabel = document.createElement('h3')
                            systemNameLabel.textContent = systemName
                            systemView.appendChild(systemNameLabel)
                            systemStatusLabel = document.createElement('h1')
                            systemStatusLabel.id = systemStatusLabelId
                            systemView.appendChild(systemStatusLabel)
                            systemStatusUpdatedLabel = document.createElement('h3')
                            systemStatusUpdatedLabel.id = systemStatusUpdatedLabelId
                            systemView.appendChild(systemStatusUpdatedLabel)
                            systemsView.appendChild(systemView)
                        }
                        systemStatusLabel.textContent = system.state
                        if (system.state === 'OK') {
                            systemStatusLabel.classList.remove('red')
                            systemStatusLabel.classList.add('green')
                        } else {
                            systemStatusLabel.classList.remove('green')
                            systemStatusLabel.classList.add('red')
                        }
                        systemStatusUpdatedLabel.textContent = system.updated
                    }
                    for (let displayedSystemName of displayedSystemNames) {
                        if (!newSystemNames.has(displayedSystemName)) {
                            let removedSystemView = document.getElementById('system_' + displayedSystemName)
                            if (removedSystemView) {
                                systemsView.removeChild(removedSystemView)
                            }
                        }
                    }
                }))
    }

    setInterval(update, 5000)
    update()
}
