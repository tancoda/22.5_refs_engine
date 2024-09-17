import { globalEdgesFormatted } from './main-new.js'; // Import the formatted edges

// Initialize Paper.js
function initializeCanvas() {
    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        paper.setup(canvas);
        resizeCanvas(); // Ensure canvas size is correct
    } else {
        console.error('Canvas element not found.');
    }
}

// Function to resize the canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        paper.view.viewSize = new paper.Size(canvas.clientWidth, canvas.clientHeight);
    }
}

// Initialize canvas on page load
initializeCanvas();
window.addEventListener('resize', resizeCanvas);

// Function to draw edges on the canvas
function drawGlobalEdges() {
    if (!paper.project) {
        console.warn('Paper.js project not initialized.');
        return;
    }

    if (globalEdgesFormatted.length === 0) {
        console.warn('No creases available to draw.');
        return;
    }

    const colorMap = {
        'B': 'black',
        'V': 'blue',
        'M': 'red'
    };

    globalEdgesFormatted.forEach(([x1, y1, x2, y2, type]) => {
        const color = colorMap[type] || 'black'; // default to black if type is not found
        const line = new paper.Path.Line(new paper.Point(x1, y1), new paper.Point(x2, y2));
        line.strokeColor = color;
    });
}

// Add event listener for drawing edges when they are ready
document.addEventListener('edgesReady', drawGlobalEdges);

console.log(globalEdgesFormatted)