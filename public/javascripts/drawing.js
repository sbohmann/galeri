window.onload = init

const svgNamespace = 'http://www.w3.org/2000/svg'
const backgroundColor = '#111'
const eventTypes = {
    beginStroke: 1,
    appendPoint: 2,
    endStroke: 3,
    clear: 4,
    undo: 5
}

const clientId = createClientId()
const remoteStrokes = new Map()
let drawing = false
let activePath = null
let activeStrokeId = 0
let nextStrokeId = 1
let points = []
let sendQueue = Promise.resolve()

function init() {
    const canvas = drawingCanvas()
    const frame = canvas.parentElement
    const exportButton = document.getElementById('exportButton')
    const clearButton = document.getElementById('clearButton')
    const undoButton = document.getElementById('undoButton')

    suppressSystemGestures(canvas)
    suppressSystemGestures(frame)

    canvas.addEventListener('pointerdown', startStroke, { passive: false })
    canvas.addEventListener('pointermove', continueStroke, { passive: false })
    canvas.addEventListener('pointerup', endStroke, { passive: false })
    canvas.addEventListener('pointerleave', endStroke, { passive: false })
    canvas.addEventListener('pointercancel', endStroke, { passive: false })

    exportButton.onclick = exportDrawing
    clearButton.onclick = clearDrawing
    undoButton.onclick = undoStroke

    connectDrawingEvents()
}

function drawingCanvas() {
    return document.getElementById('drawingCanvas')
}

function suppressSystemGestures(element) {
    for (let eventName of ['touchstart', 'touchmove', 'touchend', 'contextmenu', 'selectstart', 'dragstart']) {
        element.addEventListener(eventName, preventDefault, { capture: true, passive: false })
    }
}

function preventDefault(event) {
    event.preventDefault()
}

function startStroke(event) {
    event.preventDefault()
    drawing = true
    activeStrokeId = nextStrokeId++
    points = [svgPointForEvent(event)]
    activePath = document.createElementNS(svgNamespace, 'polyline')
    activePath.setAttribute('fill', 'none')
    activePath.setAttribute('stroke', document.getElementById('strokeColor').value)
    activePath.setAttribute('stroke-width', document.getElementById('strokeWidth').value)
    activePath.setAttribute('stroke-linecap', 'round')
    activePath.setAttribute('stroke-linejoin', 'round')
    activePath.setAttribute('points', pointList(points))
    drawingCanvas().appendChild(activePath)
    drawingCanvas().setPointerCapture(event.pointerId)
    sendEvent(encodeBeginStroke(
        activeStrokeId,
        activePath.getAttribute('stroke'),
        Number(activePath.getAttribute('stroke-width')),
        points[0]))
}

function continueStroke(event) {
    if (!drawing || !activePath) {
        return
    }
    event.preventDefault()
    points.push(svgPointForEvent(event))
    activePath.setAttribute('points', pointList(points))
    sendEvent(encodeAppendPoint(activeStrokeId, points[points.length - 1]))
}

function endStroke(event) {
    if (!drawing) {
        return
    }
    sendEvent(encodeEndStroke(activeStrokeId))
    drawing = false
    activePath = null
    activeStrokeId = 0
    points = []
    try {
        drawingCanvas().releasePointerCapture(event.pointerId)
    } catch (error) {
        // Pointer capture can already be released by the browser.
    }
}

function svgPointForEvent(event) {
    const canvas = drawingCanvas()
    const point = canvas.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const transformed = point.matrixTransform(canvas.getScreenCTM().inverse())
    return {
        x: Math.round(transformed.x * 10) / 10,
        y: Math.round(transformed.y * 10) / 10
    }
}

function pointList(points) {
    return points.map(point => `${point.x},${point.y}`).join(' ')
}

function exportDrawing() {
    const blob = new Blob([serializedDrawing()], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'drawing.svg'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    setStatus('Exported')
}

function serializedDrawing() {
    const canvas = drawingCanvas().cloneNode(true)
    canvas.insertBefore(exportBackground(), canvas.firstChild)
    return new XMLSerializer().serializeToString(canvas)
}

function exportBackground() {
    const background = document.createElementNS(svgNamespace, 'rect')
    background.setAttribute('x', '0')
    background.setAttribute('y', '0')
    background.setAttribute('width', '1200')
    background.setAttribute('height', '800')
    background.setAttribute('fill', backgroundColor)
    return background
}

function clearDrawing() {
    clearLocalDrawing()
    sendEvent(encodeSimpleEvent(eventTypes.clear))
    setStatus('')
}

function undoStroke() {
    if (undoLocalStroke()) {
        sendEvent(encodeSimpleEvent(eventTypes.undo))
    }
}

function setStatus(text) {
    document.getElementById('drawingStatus').textContent = text
}

function createClientId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID()
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function connectDrawingEvents() {
    const events = new EventSource('/drawing/events')
    events.addEventListener('drawing-event', message => {
        const event = JSON.parse(message.data)
        if (event.clientId === clientId) {
            return
        }
        applyRemoteEvent(base64ToArrayBuffer(event.data), event.clientId)
    })
    events.onerror = () => setStatus('Disconnected')
    events.onopen = () => setStatus('')
}

function sendEvent(buffer) {
    sendQueue = sendQueue
        .then(() => fetch('/drawing/event?clientId=' + encodeURIComponent(clientId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: buffer
        }))
        .then(response => {
            if (!response.ok) {
                setStatus('Sync failed')
            }
        })
        .catch(() => setStatus('Sync failed'))
}

function encodeBeginStroke(strokeId, color, width, point) {
    const buffer = new ArrayBuffer(14)
    const view = new DataView(buffer)
    const rgb = rgbForColor(color)
    view.setUint8(0, eventTypes.beginStroke)
    view.setUint32(1, strokeId)
    view.setUint8(5, rgb.r)
    view.setUint8(6, rgb.g)
    view.setUint8(7, rgb.b)
    view.setUint16(8, Math.round(width * 10))
    writePoint(view, 10, point)
    return buffer
}

function encodeAppendPoint(strokeId, point) {
    const buffer = new ArrayBuffer(9)
    const view = new DataView(buffer)
    view.setUint8(0, eventTypes.appendPoint)
    view.setUint32(1, strokeId)
    writePoint(view, 5, point)
    return buffer
}

function encodeEndStroke(strokeId) {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    view.setUint8(0, eventTypes.endStroke)
    view.setUint32(1, strokeId)
    return buffer
}

function encodeSimpleEvent(type) {
    const buffer = new ArrayBuffer(1)
    new DataView(buffer).setUint8(0, type)
    return buffer
}

function writePoint(view, offset, point) {
    view.setInt16(offset, Math.round(point.x * 10))
    view.setInt16(offset + 2, Math.round(point.y * 10))
}

function readPoint(view, offset) {
    return {
        x: view.getInt16(offset) / 10,
        y: view.getInt16(offset + 2) / 10
    }
}

function rgbForColor(color) {
    const match = color.match(/^#([0-9a-f]{6})$/i)
    if (!match) {
        return { r: 0, g: 0, b: 0 }
    }
    return {
        r: Number.parseInt(match[1].slice(0, 2), 16),
        g: Number.parseInt(match[1].slice(2, 4), 16),
        b: Number.parseInt(match[1].slice(4, 6), 16)
    }
}

function colorForRgb(red, green, blue) {
    return '#' + [red, green, blue]
        .map(value => value.toString(16).padStart(2, '0'))
        .join('')
}

function applyRemoteEvent(buffer, sourceClientId) {
    const view = new DataView(buffer)
    switch (view.getUint8(0)) {
        case eventTypes.beginStroke:
            applyRemoteBeginStroke(view, sourceClientId)
            break
        case eventTypes.appendPoint:
            applyRemoteAppendPoint(view, sourceClientId)
            break
        case eventTypes.endStroke:
            remoteStrokes.delete(strokeKey(sourceClientId, view.getUint32(1)))
            break
        case eventTypes.clear:
            clearLocalDrawing()
            break
        case eventTypes.undo:
            undoLocalStroke()
            break
    }
}

function applyRemoteBeginStroke(view, sourceClientId) {
    const strokeId = view.getUint32(1)
    const point = readPoint(view, 10)
    const path = document.createElementNS(svgNamespace, 'polyline')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', colorForRgb(view.getUint8(5), view.getUint8(6), view.getUint8(7)))
    path.setAttribute('stroke-width', view.getUint16(8) / 10)
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('points', pointList([point]))
    drawingCanvas().appendChild(path)
    remoteStrokes.set(strokeKey(sourceClientId, strokeId), path)
}

function applyRemoteAppendPoint(view, sourceClientId) {
    const path = remoteStrokes.get(strokeKey(sourceClientId, view.getUint32(1)))
    if (!path) {
        return
    }
    path.setAttribute(
        'points',
        path.getAttribute('points') + ' ' + pointList([readPoint(view, 5)]))
}

function strokeKey(sourceClientId, strokeId) {
    return sourceClientId + ':' + strokeId
}

function base64ToArrayBuffer(value) {
    const binary = window.atob(value)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return buffer
}

function clearLocalDrawing() {
    drawingCanvas().replaceChildren()
    remoteStrokes.clear()
}

function undoLocalStroke() {
    const canvas = drawingCanvas()
    if (canvas.lastElementChild) {
        canvas.removeChild(canvas.lastElementChild)
        return true
    }
    return false
}
