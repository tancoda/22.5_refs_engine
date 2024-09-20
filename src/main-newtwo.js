//import relevant brains from flatfolder
import { M } from "./flatfolder/math.js";
import { IO } from "./flatfolder/io.js";
import { AVL } from "./flatfolder/avl.js";
import { NOTE } from "./flatfolder/note.js";

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

// Initialize canvas on page load
initializeCanvas();
window.addEventListener('resize', resizeCanvas);

document.getElementById("fileInput").addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            processFile(event);
        };
        fileReader.readAsText(e.target.files[0]);
        drawEverything();
    }
});

// Function to ensure window.variable stays within range
function setWindowVariable(value) {
    if (value < 1) {
        window.variable = 1; // Set to minimum
    } else if (value > globalC2.length) {
        window.variable = globalC2.length; // Set to maximum
    } else {
        window.variable = value; // Valid value
    }
}

// Update the displayed variable value in the HTML
function updateDisplay() {
    document.getElementById('variableValue').innerText = window.variable;
}

// Function to handle file upload
function handleFileUpload() {
    window.variable = 1; // Reset window.variable to 1 when new file is uploaded
    updateDisplay(); // Update the display to reflect the new value
}

window.addEventListener('DOMContentLoaded', () => {
    window.variable = 1;

    updateDisplay();

    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('submitButton').addEventListener('click', handleFileUpload);

    document.getElementById('decreaseButton').addEventListener('click', () => {
        window.variable--;
        setWindowVariable(window.variable); // Ensure it's within valid range
        updateDisplay(); // Update the display
        drawEverything(); // Redraw the canvas
    });

    document.getElementById('increaseButton').addEventListener('click', () => {
        window.variable++;
        setWindowVariable(window.variable); // Ensure it's within valid range
        updateDisplay(); // Update the display
        drawEverything(); // Redraw the canvas
    });
});

// Function to update values based on user input
function updateValues() {
    const value1 = parseFloat(document.getElementById("value1").value);
    const value2 = parseFloat(document.getElementById("value2").value);

    // Validate and set values (you might want to add more validation)
    if (Number.isInteger(value1) && value1 > 1) defaultValue1 = value1;
    if (!isNaN(value2)) defaultValue2 = value2;

    // Rerun file processing to recalculate C2
    const fileInput = document.getElementById("fileInput").files[0];
    if (fileInput) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            processFile(event);  // Call processFile with the file content
        };
        fileReader.readAsText(fileInput);
    } else {
        alert("Please select a file before updating values.");
    };
}

const value1Input = document.getElementById("value1");
const value2Input = document.getElementById("value2");

let defaultValue1 = 50;
let defaultValue2 = 0.1;

// Set default values to inputs
value1Input.value = defaultValue1;
value2Input.value = defaultValue2;

// Add event listener to button
document.getElementById("submitButton").addEventListener("click", updateValues);
document.getElementById("submitButton").addEventListener("click", drawEverything);

// Function to resize the canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        paper.view.viewSize = new paper.Size(canvas.clientWidth, canvas.clientHeight);
    }
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
window.addEventListener('resize', drawEverything);

// Function to format the edges with coordinates and type
function formatEdges(V, EV, EA) {
    return EV.map(([a, b]) => {
        const [x1, y1] = V[a];
        const [x2, y2] = V[b];
        // Calculate the index in EA based on the edge
        const edgeIndex = EV.findIndex(edge => (edge[0] === a && edge[1] === b) || (edge[0] === b && edge[1] === a));
        const type = (edgeIndex >= 0 && EA[edgeIndex]) || 'unknown'; // Handle undefined cases
        return [x1, y1, x2, y2, type];
    });
}

let globalVi = [];
let globalEvi = [];
let globalEAi = [];
let globalC2 = [];

function drawEverything() {
    clearCanvas();

    // Get the canvas size
    const canvas = document.getElementById('myCanvas');
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    const colorMap = {
        'B': 'black',
        'V': 'blue',
        'M': 'red'
    };

    let drawFrom = formatEdges(globalVi, globalEvi, globalEAi);

    // Find the min and max x and y values
    const xs = drawFrom.map(([x1, y1, x2, y2]) => [x1, x2]).flat();
    const ys = drawFrom.map(([y1, y2]) => [y1, y2]).flat();
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Calculate width and height of the coordinates
    const width = maxX - minX;
    const height = maxY - minY;

    // Scale the pattern to fit the canvas size with some padding
    const scale = Math.min((canvasWidth / 2)/ width, canvasHeight * 0.8 / height) * 0.9;

    // Calculate offsets to center the pattern
    const offsetX = (canvasWidth/4) - (width/2)*scale;
    const offsetY = (canvasHeight/2) - (height/2)*scale;

    // Scale and translate coordinates
    drawFrom = drawFrom.map(([x1, y1, x2, y2, type]) => [
        (x1 * scale) + offsetX,
        (y1 * scale) + offsetY,
        (x2 * scale) + offsetX,
        (y2 * scale) + offsetY,
        type
    ]);

    drawFrom.forEach(([x1, y1, x2, y2, type]) => {
        const color = colorMap[type] || 'cyan';
        const line = new paper.Path.Line(new paper.Point(x1, y1), new paper.Point(x2, y2));
        line.strokeColor = color;
    });

    if (globalC2.length > 0 && globalC2[window.variable-1][3].includes("default")) {
        const targetElev = (summup(
            globalC2[window.variable-1][0],
            globalC2[window.variable-1][1],
            globalC2[window.variable-1][2]
        )) ** -1
    
        searchVi(globalVi, targetElev, 10 ** -8, scale, offsetX, offsetY);

        let method = (globalC2[window.variable-1][3]);
        let rotate = 0;

        if (xory == 'X' && (method.includes("neg"))) {
            rotate = 180;
        }
        if (xory == 'Y') {
            if (method.includes("neg")) {
                rotate = 90;
            } else rotate = -90;
        }

        const stepSize = Math.min(canvasHeight,canvasWidth/6) * .8;
        const padding = Math.min(canvasHeight,canvasWidth/6) * .075;
        const steponex1 = 3*canvasWidth/4 - stepSize - padding;
        const steponey1 = canvasHeight/2 - padding/2 - stepSize/2;
        const steponex2 = 3*canvasWidth/4;
        const steponey2 = canvasHeight/2 - padding/2 - stepSize/2;
        const steponex3 = 3*canvasWidth/4 + stepSize + padding;
        const steponey3 = canvasHeight/2 - padding/2 - stepSize/2;
        const steponex4 = 3*canvasWidth/4 - stepSize - padding;
        const steponey4 = canvasHeight/2 + padding/2 + stepSize/2;
        const steponex5 = 3*canvasWidth/4;
        const steponey5 = canvasHeight/2 + padding/2 + stepSize/2;
        const steponex6 = 3*canvasWidth/4 + stepSize + padding;
        const steponey6 = canvasHeight/2 + padding/2 + stepSize/2;

        step1((globalC2[window.variable-1][4]),stepSize,rotate,[steponex1,steponey1], 1);
        step1((globalC2[window.variable-1][4]),stepSize,rotate,[steponex2,steponey2], 2);
        step1((globalC2[window.variable-1][4]),stepSize,rotate,[steponex3,steponey3], 3);
        step1((globalC2[window.variable-1][4]),stepSize,rotate,[steponex4,steponey4], 4);

        const gonzoArray = globalC2[window.variable-1][6];

        function sloper(a,b,c,type) {
            let slopePair = [];
            let blockInfo = [];
            switch (type) {
                case 'A':
                    slopePair = [a+b, c, b, c];
                    blockInfo = [1, Math.SQRT2 -1];
                    break;
                case 'B':
                    slopePair = [a + 2*b, c, -b, c];
                    blockInfo = [1, Math.SQRT2 -1];
                    break;
                case 'C':
                    slopePair = [2*b, c, a - 2*b, c];
                    blockInfo = [1 + Math.SQRT2/2, 1];
                    break;
                case 'D':
                    slopePair = [b, c, a - b, c];
                    blockInfo = [Math.SQRT2 + 1, 1];
                    break;
                case 'E':
                    slopePair = [a + b, c, a + 2*b, c];
                    blockInfo = [2 - Math.SQRT2, Math.SQRT2 - 1];
                    break;
                case 'F':
                    slopePair = [2 * (a + b), 3 * c, -a + 2 * b, 3 * c];
                    blockInfo = [1 + Math.SQRT2/2, Math.SQRT2 - 1];
                    break;
                case 'G':
                    slopePair = [a + b, 2 * c, -a + b, 2 * c];
                    blockInfo = [Math.SQRT2 + 1, Math.SQRT2 - 1];
                    break;
                case 'H':
                    slopePair = [a + 2*b, 2 * c, a - 2*b, 4 * c];
                    blockInfo = [1 + Math.SQRT2/2, 2 - Math.SQRT2];
                    break;
                case 'I':
                    slopePair = [a + 2*b, 3 * c, a - b, 3 * c]
                    blockInfo = [Math.SQRT2 + 1, 2 - Math.SQRT2];
                    break;
                case 'J':
                    slopePair = [-a + 2*b, c, 2*a - 2*b, c]
                    blockInfo = [Math.SQRT2 + 1, 1 + Math.SQRT2/2];
                    break;
            }
            return [slopePair, blockInfo];
        };

        let typer;
        typer = (sloper(gonzoArray[0], gonzoArray[1], gonzoArray[2], globalC2[window.variable-1][4]))

        let typeA = (findRank(typer[0][0], typer[0][1])).type;
        let typeB = (findRank(typer[0][2], typer[0][3])).type;

        stepDiags(typer[0][0], typer[0][1], typeA, [typer[1][0],1], [stepSize, stepSize], [steponex2, steponey2], rotate, 1);
        stepDiags(typer[0][0], typer[0][1], typeA, [typer[1][0],1], [stepSize, stepSize], [steponex3, steponey3], rotate, 2);
        stepDiags(typer[0][2], typer[0][3], typeB, [typer[1][1],1], [-stepSize, stepSize], [steponex3, steponey3], rotate, 1);
        stepDiags(typer[0][2], typer[0][3], typeB, [typer[1][1],1], [-stepSize, stepSize], [steponex4, steponey4], rotate, 2);
        stepDiags(typer[0][0], typer[0][1], typeA, [typer[1][0],1], [stepSize, stepSize], [steponex4, steponey4], rotate, 3);

        var dSLs = new paper.Point();
        var dSLf = new paper.Point();

        if (xory == 'X') {
            dSLs.x = (steponex4 - (stepSize/2));
            dSLs.y = (steponey4 - stepSize/2 + targetElev*stepSize);
            dSLf.x = (steponex4 + (stepSize/2));
            dSLf.y = (steponey4 - stepSize/2 + targetElev*stepSize);
        } else {
            dSLs.x = (steponex4 - (stepSize/2) + targetElev*stepSize);
            dSLs.y = (steponey4 - stepSize/2);
            dSLf.x = (steponex4 - (stepSize/2) + targetElev*stepSize);
            dSLf.y = (steponey4 + stepSize/2);
        }

        var desiredLine = new paper.Path.Line ({
            from: dSLs,
            to: dSLf,
            strokeColor: 'red',
            strokeWidth: 1,
        })
    }
}
     
function searchVi(vi, searchValue, tolerance, scale, offsetX, offsetY) {
    let found = false;

    // Clear previous lines if they exist
    if (elevX) {
        elevX.remove();
        elevX = null;
    }

    if (elevY) {
        elevY.remove();
        elevY = null;
    }

    // Clear previous circles
    for (let circle of circles) {
        circle.remove();
    }
    circles = []; // Clear the circles array

    let foundXval = [];
    let foundYval = [];
    let foundValues = [];

    // Scaling functions (ensure scale, offsetX, and offsetY are defined)
    function scaleX(x) {
        return (x * scale) + offsetX;
    }

    function scaleY(y) {
        return (y * scale) + offsetY;
    }

    // Search through vi array
    for (let i = 0; i < vi.length; i++) {
        const [x, y] = vi[i];

        // Check for y value with tolerance
        if (Math.abs(y - searchValue) < tolerance) {
            foundYval.push(vi[i]);
            found = true;
        }

        // Check for x value with tolerance
        if (Math.abs(x - searchValue) < tolerance) {
            foundXval.push(vi[i]);
            found = true;
        }
    }

    // Decide which line to draw based on counts
    if (foundYval.length >= foundXval.length) {
        foundValues = foundYval;
        elevY = new paper.Path.Line(
            new paper.Point(scaleX(0), scaleY(searchValue)),
            new paper.Point(scaleX(1), scaleY(searchValue))
        );
        elevY.strokeColor = '#00ff00';
        elevY.strokeWidth = 4;
        elevY.shadowColor = 'black';
        elevY.shadowBlur = 10;
        xory = 'X';
    } else if (foundXval.length > foundYval.length) {
        foundValues = foundXval;
        elevX = new paper.Path.Line(
            new paper.Point(scaleX(searchValue), scaleY(0)),
            new paper.Point(scaleX(searchValue), scaleY(1))
        );
        elevX.strokeColor = '#00ff00';
        elevX.strokeWidth = 4;
        elevX.shadowColor = 'black';
        elevX.shadowBlur = 10;
        xory = 'Y';
    }

    // Draw new circles at found values
    for (let i = 0; i < foundValues.length; i++) {
        let circle = new paper.Path.Circle({
            center: [scaleX(foundValues[i][0]), scaleY(foundValues[i][1])],
            radius: 4,
            fillColor: 'green',
        });
        circles.push(circle); // Add circle to the list
    }

    if (!found) {
        console.log(`${searchValue} not found within tolerance ${tolerance} in Vi.`);
    }
};

function step1(type, scale, rotate, translate, time) {
    let points1 = [];
    
    const rtTwoMinusOne = [
        [0, 1, (Math.SQRT2 - 1), 0],
        [0, 1, 1, 0],
        [(Math.SQRT2 - 1), 0, (Math.SQRT2 - 1), 1]
    ];
    const twoMinusRtTwo = [
        [1, 0, (2 - Math.SQRT2), 1],
        [1, 0, 0, 1],
        [(2 - Math.SQRT2), 1, (2 - Math.SQRT2), 0]
    ];
    const onePlusHalfRtTwo = [
        [1, 0, 0, 1],
        [0, 1, 1, (2 - Math.SQRT2)],
        [0, (2 - Math.SQRT2), 1, (2 - Math.SQRT2)]
    ];
    const rtTwoPlusOne = [
        [1, 0, 0, 1],
        [1, 0, 0, (Math.SQRT2 - 1)],
        [0, (Math.SQRT2 - 1), 1, (Math.SQRT2 - 1)]
    ];

    switch (type) {
        case 'A':
            points1.push(...rtTwoMinusOne);
            break;
        case 'B':
            points1.push(...twoMinusRtTwo);
            break;
        case 'C':
            points1.push(...onePlusHalfRtTwo);
            break;
        case 'D':
            points1.push(...rtTwoPlusOne);
            break;
        case 'E':
            points1.push(...twoMinusRtTwo);
            break;
        case 'F':
            points1.push(...onePlusHalfRtTwo);
            points1.push(...rtTwoMinusOne);
            points1.splice(5, 1);
            break;
        case 'G':
            points1.push(...twoMinusRtTwo);
            points1.push([0, (Math.SQRT2 - 1), 1, (Math.SQRT2 - 1)]);
            break;
        case 'H':
            points1.push(...onePlusHalfRtTwo);
            points1.push([(Math.SQRT2 - 1), 0, (Math.SQRT2 - 1), 1]);
            break;
        case 'I':
            points1.push(...twoMinusRtTwo);
            points1.push([0, (Math.SQRT2 - 1), 1, (Math.SQRT2 - 1)]);
            break;
        case 'J':
            points1.push(...onePlusHalfRtTwo);
            points1.push(...rtTwoPlusOne);
            break;
    }
    points1 = removeDuplicates(points1);
    populate(points1, scale, rotate, translate, time);
}

function removeDuplicates(arr) {
    // Create a Set to store unique points
    const uniqueSet = new Set(arr.map(item => JSON.stringify(item)));
    // Convert the Set back to an array of arrays
    return Array.from(uniqueSet).map(item => JSON.parse(item));
}

function populate(arr, scale, rotate, translate, time) {
    const group = new paper.Group();  // Use paper.Group()

    var borderStyle = {
        strokeColor: 'black',
        strokeWidth: 1
    }

    var border = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Point(1,1));
    border.style = borderStyle;

    group.addChild(border);
    
    for (let i = 0; i < arr.length; i++) {
        // Define 'from' and 'to' as arrays with x, y coordinates
        let from = [arr[i][0], arr[i][1]];
        let to = [arr[i][2], arr[i][3]];

        // Create the line using Paper.js
        var line = new paper.Path.Line({
            from: from,
            to: to,
            strokeColor: 'black',
            strokeWidth: 1
        });

        if (time == 1) {line.strokeColor = 'red'}

        // Add the line to the group
        group.addChild(line);
    }

    // Transformations on the group
    group.scale(scale);
    group.rotate(rotate);
    group.position = new paper.Point(translate); // Use paper.Point()
}

function clearCanvas() {
    if (paper.project) {
        paper.project.activeLayer.removeChildren();
    }
}

let elevX = null;
let elevY = null;
let circles = []; // Array to store circle paths

let xory = '';

function stepDiags(a, b, type, end, scale, translate, rotate, time) {
    const orig = [0,0]
    
    const maxDim = Math.max(end[0],end[1]);
    end[0] /= maxDim;
    end[1] /= maxDim;
    
    const gcdAB = gcd(a,b);
    a /= gcdAB;
    b /= gcdAB;

    let w = end[0] - orig[0];
    let h = end[1] - orig[1];

    const MaxWH = Math.max(w,h);
    w /= MaxWH;
    h /= MaxWH;

    var vertStart = new paper.Point();
    var horiStart = new paper.Point();
    var diagStart = new paper.Point();
    var diagEnd = new paper.Point();
    var int = new paper.Point();
    var vertLabelPt = new paper.Point();
    let intRefPt = new paper.Point();
    let diagLabelPt = new paper.Point();

    let vertLabel = '';
    let horiLabel = '';
    let diagLabel = '';

    var creaseStart = new paper.Point(orig);
    var creaseEnd = new paper.Point(a*w/(Math.max(a*w,b*h)), b*h/(Math.max(a*w,b*h)));

    let horiTest = false;
    let diagTest = false;
    let vertTest = false;
    let horiJust = 'right';

    let labelGCDA, labelGCDB;
    let powTwoTest = false;
    let fontSize = 0.08

    switch (type) {
        case 'general':
            const smallestPowTwo = 2 ** Math.ceil(Math.log2(Math.max(a, b)));

            horiStart.y = h*b/smallestPowTwo;
            vertStart.x = w*a/smallestPowTwo;

            if (a > smallestPowTwo/2) {
                horiStart.x = end[0];
                horiJust = 'left'
            } else {
                horiStart.x = orig[0];
            }

            if (b > smallestPowTwo/2) {
                vertStart.y = end[1];
                vertLabelPt.y = end[1] + 1.05*fontSize;
            } else {
                vertStart.y = orig[1];
                vertLabelPt.y = orig[1] - 1.05*fontSize
            }

            int.x = w*a/smallestPowTwo;
            int.y = h*b/smallestPowTwo;

            labelGCDA = gcd(a, smallestPowTwo);
            labelGCDB = gcd(b, smallestPowTwo);

            vertLabel = `${a/labelGCDA}/${smallestPowTwo/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${smallestPowTwo/labelGCDB}`;

            intRefPt = int;

            horiTest = true;
            vertTest = true;
            break;
        case 'powTwo':
            powTwoTest = true;
            if (a>b) {
                horiTest = true;
                horiStart.x = end[0];
                horiStart.y = h*b/a;
                horiJust = 'left';
                horiLabel = `${b}/${a}`;
                intRefPt = horiStart;
            } else if (b>a) {
                vertTest = true;
                vertStart.x = w*a/b;
                vertLabelPt.y = end[1] + 1.05*fontSize;
                vertLabel = `${a}/${b}`;
                intRefPt = vertLabelPt - 1.05 * fontSize;
            }
            break;
        case 'diagA':
            if (a>=b) {
                vertStart.x = w*a/(a+b);
                vertStart.y = orig[1];
                vertLabelPt.y = vertStart.y - 1.05*fontSize
                vertTest = true;
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(a+b);
                horiTest = true;
            }

            int.x = w*a/(a+b);
            int.y = h*b/(a+b);

            labelGCDA = gcd(a, (a+b));
            labelGCDB = gcd(b, (a+b));
            vertLabel = `${a/labelGCDA}/${(a+b)/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(a+b)/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1];
            diagEnd.x = end[0];
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
        case 'diagB':
            diagLabel = '1/2';
            if (a>=b) {
                vertStart.x = w*a/(a+2*b);
                vertStart.y = orig[1];
                vertLabelPt.y = vertStart.y - 1.05*fontSize
                vertTest = true;
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(a+2*b);
                horiTest = true;
            }

            int.x = w*a/(a+(2*b));
            int.y = h*b/(a+(2*b));

            labelGCDA = gcd(a, (a+(2*b)));
            labelGCDB = gcd(b, (a+(2*b)));
            vertLabel = `${a/labelGCDA}/${(a+(2*b))/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(a+(2*b))/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1]/2;
            diagEnd.x = end[0];
            diagEnd.y = orig[1];
            diagLabelPt = diagStart;
            diagTest = true;
            break;
        case 'diagC':
            diagLabel = '1/2';
            if (a>=b) {
                vertStart.x = w*a/(2*a+b);
                vertStart.y = orig[1];
                vertTest = true;
                vertLabelPt.y = vertStart.y - 1.05*fontSize
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(2*a+b);
                horiTest = true;
            }

            int.x = w*a/(2*a + b);
            int.y = h*b/(2*a + b)

            labelGCDA = gcd(a, (2*a+b));
            labelGCDB = gcd(b, (2*a+b));
            vertLabel = `${a/labelGCDA}/${(2*a+b)/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(2*a+b)/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1];
            diagEnd.x = end[0]/2;
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
        case 'diagD':
            diagLabel = '1/4';
            if (a>=b) {
                vertStart.x = w*a/(a+4*b);
                vertStart.y = orig[1];
                vertTest = true;
                vertLabelPt.y = vertStart.y - 1.05*fontSize
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(a+4*b);
                horiTest = true;
            }

            int.x = w*a/(a+(4*b));
            int.y = h*b/(a+(4*b));

            labelGCDA = gcd(a, (a + 4*b));
            labelGCDB = gcd(b, (a + 4*b));
            vertLabel = `${a/labelGCDA}/${(a + 4*b)/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(a + 4*b)/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1]/4;
            diagEnd.x = end[0];
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
        case 'diagE':
            diagLabel = '1/4';
            if (a>=b) {
                vertStart.x = w*a/(4*a+b);
                vertStart.y = orig[1];
                vertTest = true;
                vertLabelPt.y = vertStart.y - 1.05*fontSize
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(4*a+b);
                horiTest = true;
            }

            int.x = w*a/(4*a + b);
            int.y = h*b/(4*a + b)

            labelGCDA = gcd(a, (4*a+b));
            labelGCDB = gcd(b, (4*a+b));
            vertLabel = `${a/labelGCDA}/${(4*a+b)/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(4*a+b)/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1];
            diagEnd.x = end[0]/4;
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
        case 'diagF':
            diagLabel = '3/4';
            if (a>=b) {
                vertStart.x = w*a/(a+(4*b/3));
                vertStart.y = orig[1];
                vertTest = true;
                vertLabelPt.y = vertStart.y - 1.05*fontSize
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/(a+(4*b/3));
                horiTest = true;
            }

            int.x = w*a/(a+(4*b/3));
            int.y = h*b/(a+(4*b/3));

            labelGCDA = gcd(a, (a+(4/3*b)));
            labelGCDB = gcd(b, (a+(4/3*b)));
            vertLabel = `${a/labelGCDA}/${(a+(4/3*b))/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(a+(4/3*b))/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = 3*end[1]/4;
            diagEnd.x = end[0];
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
        case 'diagG':
            diagLabel = '3/4';
            if (a>=b) {
                vertStart.x = w*a/((4*a/3)+b);
                vertStart.y = orig[1];
                vertTest = true;
                vertLabelPt.y = vertStart.y - 1.5*fontSize
            } else {
                horiStart.x = orig[0];
                horiStart.y = h*b/((4*a/3)+b);
                horiTest = true;
            }

            int.x = w*a/((4*a/3) + b);
            int.y = h*b/((4*a/3) + b)

            labelGCDA = gcd(a, (4/3*a + b));
            labelGCDB = gcd(b, (4/3*a + b));
            vertLabel = `${a/labelGCDA}/${(4/3*a + b)/labelGCDA}`;
            horiLabel = `${b/labelGCDB}/${(4/3*a + b)/labelGCDB}`;

            diagStart.x = orig[0];
            diagStart.y = end[1];
            diagEnd.x = 3*end[0]/4;
            diagEnd.y = orig[1];
            diagLabelPt = diagEnd;
            diagTest = true;
            break;
    }

    vertLabelPt.x = vertStart.x;

    var creaseStyle = {
        strokeColor: 'black',
        strokeWidth: 1
    }

    if (time == 1) {
        creaseStyle.strokeColor = 'red';
        creaseStyle.strokeWidth = 1
    }

    var borderStyle = {
        strokeColor: 'black',
        strokeWidth: 1,
    }

    var blockStyle = {
        strokeColor: 'black',
        strokeWidth: 1,
        shadowColor: 'yellow',
        shadowBlur: 5
    }

    var vertLine = new paper.Path.Line({
        from: vertStart,
        to: int
    })
    vertLine.style = creaseStyle;
    vertLine.visible = vertTest;
    vertLine.visible = !powTwoTest;

    var vertText = new paper.PointText(vertLabelPt);
    vertText.content = vertLabel;
    vertText.visible = vertTest;
    vertText.fontSize = fontSize;
    vertText.fillColor = 'black';
    vertText.justification = 'center';
    if (time !== 1) vertText.visible = false;

    var horiText = new paper.PointText(horiStart);
    horiText.content = horiLabel;
    horiText.visible = horiTest;
    horiText.fontSize = fontSize;
    horiText.fillColor = 'black';
    horiText.justification = horiJust;
    if (time !== 1) horiText.visible = false;

    var diagText = new paper.PointText(diagLabelPt);
    diagText.content = diagLabel;
    diagText.visible = diagTest;
    diagText.fontSize = fontSize;
    diagText.fillColor = 'black';
    diagText.justification = 'center';
    if (time != 1) diagText.visible = false;

    var horiLine = new paper.Path.Line({
        from: horiStart,
        to: int
    })
    horiLine.style = creaseStyle;
    horiLine.visible = horiTest;
    horiLine.visible = !powTwoTest;

    var diagLine = new paper.Path.Line({
        from: diagStart,
        to: diagEnd
    })
    diagLine.style = creaseStyle;
    diagLine.visible = diagTest;

    var creaseLine = new paper.Path.Line({
        from: creaseStart,
        to: creaseEnd
    })
    creaseLine.style = creaseStyle;

    var block = new paper.Path.Rectangle(new paper.Point(orig[0], orig[1]), new paper.Point(end[0], end[1]));;
    block.style = blockStyle;
    if (time != 1) block.visible = false;

    var border = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Point(1,1));
    border.style = borderStyle;
    border.visible = false;

    var intRef = new paper.Path.Circle({
        center: intRefPt,
        radius: 3/Math.max(scale[0],scale[1]),
        fillColor: 'black',
    });
    if (time !== 1) intRef.visible = false;

    let group = new paper.Group([border, block, creaseLine, diagLine, horiLine, vertLine, horiText, vertText, intRef, diagText]);

    const scaleX = scale[0];
    const scaleY = scale[1];

    group.pivot = new paper.Point(0.5,0.5)
    group.scale(scaleX, scaleY);
    group.rotate(rotate);
    group.position = new paper.Point(translate[0], translate[1]);

    if (scaleX < 0) {
        vertText.scale(-1,1);
        horiText.scale(-1,1);
        diagText.scale(-1,1);
    }
    
    if (scaleY < 0) {
        vertText.scale(1,-1);
        horiText.scale(1,-1);
        diagText.scale(-1,1);
    }

    horiText.rotation = 0;
    vertText.rotation = 0;
    diagText.rotation = 0;

    // Return the group for further manipulation if needed
    return group;
}

// Function to handle file input and extract coordinates
function processFile(event) {
    NOTE.clear_log();
    NOTE.start("*** Starting File Import ***");
    const doc = event.target.result;
    const file_name = document.getElementById("fileInput").value;
    const parts = file_name.split(".");
    const type = parts[parts.length - 1].toLowerCase();
    NOTE.time(`Importing from file ${file_name}`);
    
    const [V_org, VV, EVi, EAi, EF, FV, FE] = IO.doc_type_side_2_V_VV_EV_EA_EF_FV_FE(doc, type, true);
    const Vi = M.normalize_points(V_org);
    globalVi = Vi;
    globalEvi = EVi;
    globalEAi = EAi;

    const EPS = 10**(-8);
    
    const [C, VC] = V_2_C_VC(Vi, EPS);
    
    const target = { C, VC, EV: EVi, EA: EAi, FV };

    processC2(C, EPS).then(C2 => {
        globalC2 = C2;
        target.C2 = C2;
        update(target, EPS);
    }).catch(error => {
        console.error('Failed to process C2:', error);
        NOTE.time(`Failed to process C2: ${error.message}`);
    });

    drawEverything();
}

// Function to convert vertices to radical form
function V_2_C_VC(V, eps) {
    const Ci = [];
    for (let i = 0; i < V.length; ++i) {
        for (const j of [0, 1]) {
            Ci.push([V[i][j], i, j]);
        }
    }
    Ci.sort(([a, ai, aj], [b, bi, bj]) => a - b);
    const C = [];
    const VC = V.map(() => [undefined, undefined]);
    C.push(Ci[0][0]);
    VC[Ci[0][1]][Ci[0][2]] = 0;
    for (let i = 1; i < Ci.length; ++i) {
        const [c1, i1, j1] = Ci[i - 1];
        const [c2, i2, j2] = Ci[i];
        if (c2 - c1 > eps) {
            C.push(c2);
        }
        VC[i2][j2] = C.length - 1;
    }
    return [C, VC];
}

// Function to update the display or data structure
function update(target, eps) {
    const { C, VC, EV, EA, FV, C2 } = target;
}

// Function to process C2 with a Promise
function processC2(C, eps) {
    return new Promise((resolve, reject) => {
        try {
            let C2 = checkPi8(C, eps);

            function isComplete(element) {
                return element !== undefined}
            
            C2 = C2.filter(isComplete);
            
            C2.forEach(([a, b, c, d], index) => {
                const [alpha, beta, gamma] = toABC(a, b, c, d);
                C2[index] = [alpha, beta, gamma]
            });

            function constructible(element) {
                const gamma = element[2];
                return ((Math.log(gamma)/Math.log(2)) % 1 !== 0);
            }

            const C2con = C2.filter(constructible);

            if (C2con.length > C2.length/2){
                C2 = C2con;
            }

            C2.forEach(([a, b, c], index) => {
                const [alpha, beta, gamma] = inverse(a, b, c);
                C2[index] = [alpha, beta, gamma];
            })

            C2.forEach(([a, b, c], index) => {
                const [alpha, beta, gamma] = normalize(a, b, c);
                C2[index] = [alpha, beta, gamma];
            })

            function updateC2(C2) {
                return C2.map(([a, b, c]) => {
                    const minType = alts(a, b, c);
                    return [a, b, c, minType.name, minType.meth, minType.value, minType.elev];
                });
            }

            C2 = updateC2(C2);

            C2 = C2.filter(item => 
                item[5] !== undefined && item[6] !== null &&
                !(
                    (item[0] === 1 && item[1] === 0 && item[2] === 1) || 
                    (item[0] === 1 && item[1] === -0 && item[2] === 1)
                )
            );

            function isReasonable (element) {
                return ((summup (element[0], element[1], element[2]) < (defaultValue2 ** -1)) && (summup (element[0], element[1], element[2]) > ((1 - defaultValue2) ** -1)))
            }

            C2 = C2.filter(isReasonable);

            C2.sort((a, b) => {
                if (a === undefined || b === undefined) return Infinity; // Handle undefined values
                return (a[5] || 0) - (b[5] || 0); // Compare minType.value (index 5)
            });

            globalC2 = C2

            console.log(C2);
            resolve(C2);
        } catch (error) {
            reject(error);
        }
    });
}

//below is the maths stuff, which for now is working FINE don't mess with it.  The ranking equations will need to be updated.
function summup(a,b,c) {
    return (a + (b * Math.SQRT2)) / c
}

function normalize(a,b,c) {
    let grcodi = gcd(gcd(a, b), c);
    if (summup(a,b,c) < 0 || ((a + (b * Math.SQRT2) < 0) && (c < 0))) {
        a = -a;
        b = -b;
        c = -c;
    };
    return [a/grcodi, b/grcodi, c/grcodi];
}

function inverse(a, b, c) {
    let alpha = a * c;
    let beta = -b * c;
    let gamma = (a ** 2) - (2 * (b ** 2));

    return [alpha, beta, gamma]
}

function gcd(a, b) {
    if (b) {
        return gcd(b, a % b);
    } else {
        return Math.abs(a);
    }
}

function toABC(a, b, c, d) {
    let alpha, beta, gamma;
    if (c**2 - 2 * d**2 >= 0) {
        alpha = a * c - 2 * b * d;
        beta = b * c - a * d;
        gamma = c**2 - 2 * d**2;
    } else {
        alpha = -a * c + 2 * b * d;
        beta = -b * c + a * d;
        gamma = 2 * d**2 - c**2;
    }
    let grcodi = gcd(gamma,gcd(alpha,beta));
    return [alpha/grcodi, beta/grcodi, gamma/grcodi];
}

// Function to check if coordinates are at pi/8 and return corresponding radical forms
const checkPi8 = (C, eps) => {
    const r2 = Math.sqrt(2);
    const val = ([a, b]) => a + r2 * b;
    const T = new AVL((a, b) => Math.abs(a - b) < eps ? 0 : a - b);
    const M = new Map();
    T.insert(0);
    T.insert(1);
    M.set(0, [0, 0, 1, 0]);
    M.set(1, [1, 0, 1, 0]);

    for (let n = 0; n < 50; ++n) {
        for (let i = 0; i <= n; ++i) {
            for (let j = 0; j <= n - i; ++j) {
                for (const [a, b] of [[j, i], [-j, i], [j, -i]]) {
                    const num = val([a, b]);
                    if (num < 0) continue;
                    for (let k = 0; k <= n - i - j; ++k) {
                        const l = n - i - j - k;
                        for (const [c, d] of [[l, k], [-l, k], [l, -k]]) {
                            const den = val([c, d]);
                            if (den <= 0) continue;
                            const v = num / den;
                            if (v > 1) continue;
                            const u = T.insert(v);
                            if (u === undefined) {
                                M.set(v, [a, b, c, d]);
                            }
                        }
                    }
                }
            }
        }
    }

    return C.map(v => {
        const u = T.insert(v);
        return u === undefined ? undefined : M.get(u);
    });
};

//----------------------------------------------------------------------------------------

// PART ONE: Generates the farey sequence of all fractions having a denominator less than or equal to n.
// Each fraction corresponds to a slope.  The lookup table records the number of creases required
// to develop that slope, and the methodology used to do so.

let lookupTable = [];

//most extreme fraction
const m = (1/defaultValue2);

// if b is a power of 2, the reference may be developed in log2(b)+1 folds
function powTwo(b) {
    if ((Math.log(b)/Math.log(2)) % 1 === 0) {
        return Math.log(b)/Math.log(2) + 1;
    } else {
        return Infinity;
    }
}

//if a+b is a power of 2, the reference may be developed in log2(a+b)+2 folds
function diagA(a,b) {
    if ((Math.log(a+b)/Math.log(2)) % 1 === 0) {
        return Math.log(a+b)/Math.log(2) + 2;
    } else {
        return Infinity;
    }
}

//etc.
function diagB(a,b) {
    if ((Math.log((2*a)+b)/Math.log(2)) % 1 === 0) {
        return Math.log((2*a)+b)/Math.log(2) + 3;
    } else {
        return Infinity;
    }
}

function diagC(a,b) {
    if ((Math.log(a+(2*b))/Math.log(2)) % 1 === 0) {
        return Math.log(a+(2*b))/Math.log(2) + 3;
    } else {
        return Infinity;
    }
}

function diagD (a,b) {
    if ((Math.log((4*a)+b)/Math.log(2)) % 1 === 0) {
        return Math.log((4*a)+b)/Math.log(2) + 4;
    } else {
        return Infinity;
    }
}

function diagE (a,b) {
    if ((Math.log(a+(4*b))/Math.log(2)) % 1 === 0) {
        return Math.log(a+(4*b))/Math.log(2) + 4;
    } else {
        return Infinity;
    }
}

function diagF (a,b) {
    if ((Math.log(((4/3)*a)+b)/Math.log(2)) % 1 === 0) {
        return Math.log(((4/3)*a)+b)/Math.log(2) + 4;
    } else {
        return Infinity;
    }
}

function diagG (a,b) {
    if ((Math.log(a+((4/3)*b))/Math.log(2)) % 1 === 0) {
        return Math.log(a+((4/3)*b))/Math.log(2) + 4;
    } else {
        return Infinity;
    }
}

function general(a,b) {
    if ((Math.log(b)/Math.log(2)) % 1 != 0) {
        let c = Math.floor((Math.log(b)/Math.log(2)))+1;
        return Math.log((Math.pow(2,c))/(gcd((Math.pow(2,c)),a)))/Math.log(2) + 
        Math.log((Math.pow(2,c))/(gcd((Math.pow(2,c)),b)))/Math.log(2) + 1;
    } else {
        return Infinity;
    }
}

function type (a,b) {
    let min = Math.min(powTwo(b), diagA(a,b), diagB(a,b), diagC(a,b), diagD(a,b), diagE(a,b), diagF(a,b), diagG(a,b), general(a,b));
    if (powTwo(b)===min){
        return "powTwo";
    } else if (diagA(a,b)===min){
        return "diagA";
    } else if (diagB(a,b)===min){
        return "diagB";
    } else if (diagC(a,b)===min){
        return "diagC";
    } else if (diagD(a,b)===min){
        return "diagD";
    } else if (diagE(a,b)===min){
        return "diagE";
    } else if (diagF(a,b)===min){
        return "diagF";
    } else if (diagG(a,b)===min){
        return "diagG";
    } else if (general(a,b)===min){
        return "general";
    } else return error
}

// Generate the Farey sequence
for (let b = 1; b <= defaultValue1; b++) {
    for (let a = 0; a <= b; a++) {
        if (gcd(a, b) === 1) {  // Check if gcd(a, b) == 1 (i.e., they are coprime)
            lookupTable.push({ 
                numerator: a, 
                denominator: b, 
                weight: a/b, 
                rank: Math.min(powTwo(b), diagA(a,b), diagB(a,b), diagC(a,b), diagD(a,b), diagE(a,b), diagF(a,b), diagG(a,b), general(a,b)),
                type: type(a,b),
            },
        );
        }
    }
}

// Sort the fractions by their value (numerator/denominator)
lookupTable.sort((frac1, frac2) => (frac1.numerator / frac1.denominator) - (frac2.numerator / frac2.denominator));

// Function to search for a specific numerator and denominator
function findRank(numerator, denominator) {
    // Check if the fraction is greater than one
    if (numerator > denominator) {
        // Swap numerator and denominator for fractions greater than 1
        [numerator, denominator] = [denominator, numerator];
    }
    if (numerator/denominator < 0 || (numerator < 0 && denominator < 0)) {
        [numerator, denominator] = [-numerator, -denominator]
    }

    let gcdND = gcd(numerator, denominator);
    numerator /= gcdND;
    denominator /= gcdND;

    //performs regular search
    if (numerator === 0) {
        return 0;
    } else if (numerator/denominator === 1){
        return 1;
    } else if (denominator/numerator > m || numerator/denominator > m){
        return Infinity;
    }
    else {
        let result = lookupTable.find(row => row.numerator === numerator && row.denominator === denominator);
        return result ? result: null;
    }
}

// Function you can call later to search after data is loaded
function searchForFraction(numerator, denominator) {
    if (denominator <= defaultValue1 && numerator <= defaultValue1) {
        return (findRank(numerator/gcd(numerator,denominator), denominator/gcd(numerator,denominator))).rank;
    } else {
        return Infinity;
    }
}

//---------------------------------------------------------------------------------------------------------
// PART TWO: A rectangle having w/h = (a + b(rt2)) / c can be decomposed into a pair of slopes in ten possible ways.
// This section calculates the number of creases required for each situation, and reports the most efficient option,
// and the corresponding number of creases.

function rankIt(alpha, beta, gamma) {

    if (summup(alpha, beta, gamma) < 0 || (gamma < 0 && (alpha + (beta * Math.SQRT2))) < 0){
        alpha = -alpha;
        beta = -beta;
        gamma = -gamma;
    }

    let grcodi = gcd(gcd(alpha, beta), gamma);

    alpha = alpha/grcodi;
    beta = beta/grcodi;
    gamma = gamma/grcodi;

    // Initialize ranks with default values
    let rankA = Infinity, rankB = Infinity, rankC = Infinity, rankD = Infinity;
    let rankE = Infinity, rankF = Infinity, rankG = Infinity, rankH = Infinity;
    let rankI = Infinity, rankJ = Infinity;

    // Perform the checks and calculations
    if (beta >= 0 && alpha + beta >= 0) {
        const rank1 = searchForFraction(beta, gamma);
        const rank2 = searchForFraction(alpha + beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankA = rank1 + rank2;
            if (rank1 !== 0) {
                rankA += 3;
            }
        }
    }
    if (beta <= 0 && alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(-beta, gamma);
        const rank2 = searchForFraction(alpha + 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankB = rank1 + rank2;
            if (rank1 !== 0) {
                rankB += 3;
            }
        }
    }
    if (beta >= 0 && alpha - 2 * beta >= 0) {
        const rank1 = searchForFraction(2 * beta, gamma);
        const rank2 = searchForFraction(alpha - 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankC = rank1 + rank2;
            if (rank1 !== 0) {
                rankC += 3;
            }
        }
    }
    if (beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(beta, gamma);
        const rank2 = searchForFraction(alpha - beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankD = rank1 + rank2;
            if (rank1 !== 0) {
                rankD += 3;
            }
        }
    }
    if (alpha + beta >= 0 && alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(alpha + beta, gamma);
        const rank2 = searchForFraction(alpha + 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankE = rank1 + rank2 + 3;
        }
    }
    if (alpha + beta >= 0 && -alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(2 * alpha + 2 * beta, 3 * gamma);
        const rank2 = searchForFraction(-alpha + 2 * beta, 3 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankF = rank1 + rank2 + 3;
            if (rank1 !== 0 && rank2 !== 0) {
                rankF += 1;
            }
        }
    }
    if (alpha + beta >= 0 && -alpha + beta >= 0) {
        const rank1 = searchForFraction(alpha + beta, 2 * gamma);
        const rank2 = searchForFraction(-alpha + beta, 2 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankG = rank1 + rank2 + 3;
            if (rank1 !== 0 && rank2 !== 0) {
                rankG += 1;
            }
        }
    }
    if (alpha + 2 * beta >= 0 && alpha - 2 * beta >= 0) {
        const rank1 = searchForFraction(alpha + 2 * beta, 2 * gamma);
        const rank2 = searchForFraction(alpha - 2 * beta, 4 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankH = rank1 + rank2 + 3;
            if (rank1 !== 0 && rank2 !== 0) {
                rankH += 1;
            }
        }
    }
    if (alpha + 2 * beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(alpha + 2 * beta, 3 * gamma);
        const rank2 = searchForFraction(alpha - beta, 3 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankI = rank1 + rank2 + 3;
            if (rank1 !== 0 && rank2 !== 0) {
                rankI += 1;
            }
        }
    }
    if (-alpha + 2 * beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(-alpha + 2 * beta, gamma);
        const rank2 = searchForFraction(2 * alpha - 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankJ = rank1 + rank2 + 3;
            if (rank1 !== 0 && rank2 !== 0) {
                rankJ += 2;
            }
        }
    }

    const types = [
        { name: "A", value: rankA },
        { name: "B", value: rankB },
        { name: "C", value: rankC },
        { name: "D", value: rankD },
        { name: "E", value: rankE },
        { name: "F", value: rankF },
        { name: "G", value: rankG },
        { name: "H", value: rankH },
        { name: "I", value: rankI },
        { name: "J", value: rankJ }
    ];
    
    // Check if all ranks are Infinity
    const allInfinity = types.every(type => type.value === Infinity);
    
    if (allInfinity) {
        return ["N/A", Infinity];
    }
    
    // Find the object with the minimum value
    const minType = types.reduce((min, current) => current.value < min.value ? current : min, types[0]);
    
    // Return the type corresponding to the minimum value
    return [minType.name, minType.value];
}

//---------------------------------------------------------------------------------------------------------------

function findBisector(a,b,c) {
    if ((summup(a,b,c) >= Math.SQRT2 + 1)) {
    //CORRECT
        let bisoA =  (2 * a * c * ((a ** 2) - (2 * (b ** 2))) * ((a ** 2) - (2 * (b ** 2)) - (c ** 2)));
        let bisoB = (-2 * b * c * ((a ** 2) - (2 * (b ** 2))) * ((a ** 2) - (2 * (b ** 2)) + (c ** 2)));
        let bisoC = ((a ** 2) * (((a ** 2) - (2 * (b ** 2)) - (c ** 2)) ** 2) - (2 * (b ** 2) * (((a ** 2) - (2 * (b ** 2)) + (c ** 2)) ** 2)));

        let bisA = bisoA * bisoC;
        let bisB = -bisoB * bisoC;
        let bisC = (bisoA**2) - (2 * (bisoB ** 2))

        if ((summup(bisA, bisB, bisC) < 0) || (bisA + (bisB * Math.SQRT2) < 0 && bisC < 0)) {
            bisA = -bisA;
            bisB = -bisB;
            bisC = -bisC;
        } 

        let bisG = gcd((gcd(bisA, bisB)), bisC);
        return [bisA/bisG, bisB/bisG, bisC/bisG];

    } else if ((summup(a,b,c) <= Math.SQRT2 + 1 && (summup(a,b,c) >= 1))) {
    //CORRECT
        let bisA =  (2 * a * c * ((a ** 2) - (2 * (b ** 2))) * ((a ** 2) - (2 * (b ** 2)) - (c ** 2)));
        let bisB = (-2 * b * c * ((a ** 2) - (2 * (b ** 2))) * ((a ** 2) - (2 * (b ** 2)) + (c ** 2)));
        let bisC = ((a ** 2) * (((a ** 2) - (2 * (b ** 2)) - (c ** 2)) ** 2) - (2 * (b ** 2) * (((a ** 2) - (2 * (b ** 2)) + (c ** 2)) ** 2)));

        if ((summup(bisA, bisB, bisC) < 0) || (bisA + (bisB * Math.SQRT2) < 0 && bisC < 0)) {
            bisA = -bisA;
            bisB = -bisB;
            bisC = -bisC;
        } 

        let bisG = gcd((gcd(bisA, bisB)), bisC);
        return [bisA/bisG, bisB/bisG, bisC/bisG];
            
    } else {
        return [Infinity, Infinity, Infinity]
    }
}

function findSwitchIt(a,b,c) {
    //CORRECT
    if (summup(a,b,c) > 1) {

        let swiA = (((a-c)*(a+c))-(2*(b**2)));
        let swiB = ((-2)*b*c);
        let swiC = (((a-c)**2)-(2*(b**2)));

        if ((summup(swiA, swiB, swiC) < 0) || (swiA + (swiB * Math.SQRT2) < 0 && swiC < 0)) {
            swiA = -swiA;
            swiB = -swiB;
            swiC = -swiC;
        } 

        let swiG = gcd((gcd(swiA, swiB)), swiC);
        return [swiA/swiG, swiB/swiG, swiC/swiG];

    } else {
        return [Infinity, Infinity, Infinity]
    }
}

function findHSA(a,b,c) {
    //CORRECT
    if (summup(a,b,c) >= 1) {
    
    let hsaA = a * ((a ** 2) - (2 * (b ** 2)) + (c ** 2));
    let hsaB = -b * (-(a ** 2) + (2 * (b ** 2)) + (c ** 2));
    let hsaC = 2 * c * ((a ** 2) - (2 * (b ** 2)));

    if ((summup(hsaA, hsaB, hsaC) < 0) || (hsaA + (hsaB * Math.SQRT2) < 0 && hsaC < 0)) {
        hsaA = -hsaA;
        hsaB = -hsaB;
        hsaC = -hsaC;
    } 

    let hsaG = gcd((gcd(hsaA, hsaB)), hsaC);
    return [hsaA/hsaG, hsaB/hsaG, hsaC/hsaG]
    } else {
        return [Infinity, Infinity, Infinity]
    }
}

function findHSB(a,b,c) {
    //CORRECT!
    if (summup(a,b,c) >= 1) {
    
    let hsBA = (a ** 4) + (4 * (b ** 4)) - (c ** 4) - (4 * (a ** 2) * (b ** 2));
    let hsBB = -4 * a * b * (c ** 2);
    let hsBC = (a ** 4) + (4 * (b ** 4)) + (c ** 4) - (2 * (a ** 2) * (c ** 2)) - (4 * (a ** 2) * (b ** 2)) - (4 * (b ** 2) * (c ** 2));

    if ((summup(hsBA, hsBB, hsBC) < 0) || (hsBA + (hsBB * Math.SQRT2) < 0 && hsBC < 0)) {
        hsBA = -hsBA;
        hsBB = -hsBB;
        hsBC = -hsBC;
    } 

    let hsBG = gcd((gcd(hsBA, hsBB)), hsBC);
    return [hsBA/hsBG, hsBB/hsBG, hsBC/hsBG]
    } else {
        return [Infinity, Infinity, Infinity]
    }
}

function alts(a, b, c) {
    function neg(a, b, c) {
        const alpha = (a ** 2) - (a * c) - (2 * (b ** 2));
        const beta = -b * c;
        const gamma = ((a - c) ** 2) - (2 * (b ** 2));

        const grcodi = gcd(gcd(alpha, beta), gamma);

        if ((summup(alpha, beta, gamma) < 0) || (alpha + (beta * Math.SQRT2) < 0 && gamma < 0)) {
            return [-alpha / grcodi, -beta / grcodi, -gamma / grcodi];
        }

        return [alpha / grcodi, beta / grcodi, gamma / grcodi];
    }

    function createRankType(name, values, rankIncrement = 0) {
        const rank = rankIt(values[0], values[1], values[2]);
        const negValues = neg(values[0], values[1], values[2]);
        const rankNeg = rankIt(negValues[0], negValues[1], negValues[2]);
        
        return [
            { name: name, meth: rank[0], value: rank[1] + rankIncrement, elev: values },
            { name: `neg${name}`, meth: rankNeg[0], value: rankNeg[1] + rankIncrement, elev: negValues }
        ];
    }

    // Default and negdefault
    const defaultType = createRankType('default', [a, b, c]);

    // Double and negdouble (only calculate if summup > 2)
    const doubleType = summup(a, b, c) > 2 ? createRankType('double', [a, b, 2 * c], 1) : [{ name: 'double', meth: 'N/A', value: Infinity }, { name: 'negdouble', meth: 'N/A', value: Infinity }];

    // Quadruple and negquadruple (only calculate if summup > 4)
    const quadrupleType = summup(a, b, c) > 4 ? createRankType('quadruple', [a, b, 4 * c], 2) : [{ name: 'quadruple', meth: 'N/A', value: Infinity }, { name: 'negquadruple', meth: 'N/A', value: Infinity }];

    // Bisector and negbisector
    const bisectorValues = findBisector(a, b, c);
    const bisectorType = createRankType('bisector', bisectorValues, 2);

    // SwitchIt and negSwitchIt
    const switchItValues = findSwitchIt(a, b, c);
    const switchItType = createRankType('switchIt', switchItValues, 2);

    // HSA and negHSA
    const hsaValues = findHSA(a, b, c);
    const hsaType = createRankType('HSA', hsaValues, 2);

    // HSB and negHSB
    const hsbValues = findHSB(a, b, c);
    const hsbType = createRankType('HSB', hsbValues, 2)

    // Combine all rank types into one array
    const types = [
        ...defaultType,
        ...doubleType,
        ...quadrupleType,
        ...bisectorType,
        ...switchItType,
        ...hsaType,
        ...hsbType
    ];

    // Check if all ranks are Infinity
    const allInfinity = types.every(type => type.value === Infinity);
    if (allInfinity) {
        return ["N/A", Infinity];
    }

    // Find the object with the minimum value
    const minType = types.reduce((min, current) => current.value < min.value ? current : min, types[0]);

    // Return the type corresponding to the minimum value
    return {
         name: minType.name, 
         meth: minType.meth, 
         value: minType.value, 
         elev: minType.elev
    };
}