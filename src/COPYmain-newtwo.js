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
    document.getElementById("value1Modal").value = defaultValue1
    document.getElementById("value2Modal").value = defaultValue2
    document.getElementById("constructibleToggle").value = defaultConstructible
    document.getElementById("constructibleToggle").checked = defaultConstructible
    updateInfoText(); // Update the status text
}

// Function to handle file upload
function handleFileUpload() {
    
    window.variable = 1; // Reset window.variable to 1
    resetOtherVars(); // Call to reset other variables
    console.log("Settings reset to defaults.");

    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            processFile(event); // Process the file after reading
            updateInfoText(event); // Update the display after file processing
        };
        fileReader.readAsText(fileInput.files[0]);
    }
}

// Default values
const defaults = {
    AX: 0,
    BX: 0,
    CX: 1,
    AY: 0,
    BY: 0,
    CY: 1
};

// Assign values to the input elements
Object.keys(defaults).forEach(key => {
    document.getElementById(`input${key}`).value = defaults[key];
});

document.getElementById('submitABC').addEventListener('click', abcRender);

function abcRender () {
    defaultValue1 = 32; 
    defaultValue2 = 0.1; 
    defaultConstructible = false; 
    document.getElementById("value1Modal").value = 32;
    document.getElementById("value2Modal").value = 0.1;
    document.getElementById("constructibleToggle").value = false;
    document.getElementById("constructibleToggle").checked = false;
    window.variable = 1;

    let ax = parseFloat(inputAX.value);
    let bx = parseFloat(inputBX.value);
    let cx = parseFloat(inputCX.value);
    let ay = parseFloat(inputAY.value);
    let by = parseFloat(inputBY.value);
    let cy = parseFloat(inputCY.value);

    console.log (ax)
    console.log (bx)
    console.log (cx)
    console.log (ay)
    console.log (by)
    console.log (cy)

    let a = cy * (ax * ay - 2 * bx * by);
    let b = cy * (ay * bx - ax * by);
    let c = cx * (ay ** 2 - 2 * by ** 2);

    let localxory = 'Y'

    if (summup(a, b, c) < 1) {
        [a, b, c] = inverse(a,b,c);
        localxory = 'X'
    }

    [a, b, c] = normalize(a,b,c)

    //let nega, negb, negc;
    //[nega, negb, negc] = normalize(((a ** 2) - (a * c) - (2 * (b ** 2))), (-b * c), (((a - c) ** 2) - (2 * (b ** 2))))
//
    //let typesArr = [[a, b, c], [nega, negb, negc]]
    //console.log(typesArr)

    if (summup(a,b,c) > 0) {
        if (summup(a,b,c) <= defaultValue2 ** -1) {
            if (c <= defaultValue1) {
                let inputC2 = [];

                let types = ['default', 'negdefault']
    
                for(let i = 0; i < types.length; i++) {
                    let globular = rankIt(a, b, c, types[i], 'abcRender');
                    inputC2.push(...globular);
                }
                    
                //function isReasonable (element) {
                //    return ((summup (element[0], element[1], element[2]) < (defaultValue2 ** -1)) && (summup (element[0], element[1], element[2]) > ((1 - defaultValue2) ** -1)))
                //}
        //
                //inputC2 = inputC2.filter(isReasonable);
        //
                inputC2.sort((a, b) => {
                    if (a === undefined || b === undefined) return Infinity;
                    return (a[5] || 0) - (b[5] || 0);
                });

                function isNotInfinity (arr) {
                    return (arr[5] !== Infinity)
                }

                inputC2 = inputC2.filter(isNotInfinity);
    
                globalC2 = inputC2;
    
                let startTester = new paper.Point(0,0);
                let finishTester = new paper.Point(1,1);
    
                if (localxory === 'Y') {
                    startTester.y = summup(a, b, c) ** -1;
                    finishTester.y = summup(a, b, c) ** -1;
                    xory = 'Y';
                } else {
                    startTester.x = summup(a, b, c) ** -1;
                    finishTester.x = summup(a, b, c) ** -1;
                    xory = 'X';
                }
    
                globalVi = [[0,0], [0,1], [1,1], [1,0], [startTester.x, startTester.y], [finishTester.x, finishTester.y]];
    
                console.log(globalVi)
    
                console.log(globalC2)
    
                globalEvi = [[0,1],[1,2],[2,3],[0,3],[4,5]]
    
                globalEAi = ['B', 'B', 'B', 'B', 'M']
    
                drawEverything();
                updateDisplay();
            } else alert ("Either choose a less convoluted value or increase the maximum allowable denominator.")
        } else alert ("Either choose a larger value, or decrease the minimum allowable distance from the edge.")
    } else alert("aₓ + bₓ√2 and aᵧ + bᵧ√2 must both be greater than zero.")
}

// Function to reset other variables to default values
function resetOtherVars() {
    defaultValue1 = 32; // Reset to default value
    defaultValue2 = 0.1; // Reset to default value
    defaultConstructible = true; // Reset to default value
    document.getElementById("value1Modal").value = 32;
    document.getElementById("value2Modal").value = 0.1;
    document.getElementById("constructibleToggle").value = false;
    document.getElementById("constructibleToggle").checked = true;
    document.getElementById("inputAX").value = 0;
    document.getElementById("inputBX").value = 0;
    document.getElementById("inputCX").value = 1;
    document.getElementById("inputAY").value = 0;
    document.getElementById("inputBY").value = 0;
    document.getElementById("inputCY").value = 1;
    updateDisplay(); // Update the display to reflect the new values
}

function updateInfoText() {
    const fileStatus = document.getElementById('fileStatus');
    // Check if globalC2 has valid references after processing the file
    if (globalC2.length > 0 && window.variable > 0 && window.variable <= globalC2.length) {
        const reference = globalC2[window.variable - 1];
        let xory2 = "x";
        if (xory === 'X') { xory2 = 'y'; }

        let inversed = inverse(reference[6][0], reference[6][1], reference[6][2]);

        if (xory2 === 'y' ^ reference[3].includes('neg')) {
            inversed[0] = inversed[2] - inversed[0];
            inversed[1] = -inversed[1];
        }

        inversed = normalize(inversed[0], inversed[1], inversed[2]);

        let value = (summup(inversed[0], inversed[1], inversed[2]));

        let additional;
        if (cIsPowTwoTest) {
            additional = 'The c values are of the form 2^n, so the creases lie along a 22.5° grid.';
        } else {
            additional = 'The c values are not of the form 2^n, so a reference sequence is necessary.';
        }

        // Update the file status text
        fileStatus.textContent = `${globalC2.length} references available. ${additional}
        Reference ${window.variable}: ${xory2} = (${inversed[0]} + ${inversed[1]}√2) / ${inversed[2]} ≈ ${value.toFixed(3)}.
        Approximate rank: ${reference[5]}.`;
    } else {
        fileStatus.textContent = "Upload a file to begin, or input a, b, and c corresponding to a reference having width (aₓ + bₓ√2) / cₓ and height (aᵧ + bᵧ√2) / cᵧ.";
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.variable = 1; // Initialize variable on load
    updateDisplay(); // Initial display update

    // Event listeners for increase and decrease buttons
    document.getElementById('decreaseButton').addEventListener('click', () => {
        window.variable--;
        xorycommand = '';
        setWindowVariable(window.variable);
        updateDisplay();
        drawEverything();
    });

    document.getElementById('increaseButton').addEventListener('click', () => {
        window.variable++;
        xorycommand = '';
        setWindowVariable(window.variable);
        updateDisplay();
        drawEverything();
    });
});

// Function to update values based on user input
function updateValues() {
    window.variable = 1;
    const value1 = parseInt(document.getElementById("value1Modal").value);
    const value2 = parseFloat(document.getElementById("value2Modal").value);
    const constructibleCheckbox = document.getElementById("constructibleToggle");
    const isConstructible = constructibleCheckbox.checked; // true or false

    // Validate and set values
    if (Number.isInteger(value1) && value1 >= 1) {
        if (value1 > defaultValue1 && defaultValue1 >= 32) {
            defaultValue1 = value1;
            generateFarey();
            console.log("farey generated");
        } else defaultValue1 = value1;
    }
    if (!isNaN(value2)) defaultValue2 = value2;

    defaultConstructible = isConstructible;

    // Rerun file processing to recalculate C2
    const fileInput = document.getElementById("fileInput").files[0];
    if (fileInput) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            processFile(event);  // Call processFile with the file content
        };
        fileReader.readAsText(fileInput);
    } else if (inputAX.value !== 0 || inputBX.value !== 0 || inputAY.value !== 0 || inputBY.value !== 0) {
        abcRender();
    } else {
        alert("Please select a file before updating values.");
    };
}

document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('fileInput').addEventListener('change', resetOtherVars);

const value1Input =     document.getElementById("value1Modal");
const value2Input =     document.getElementById("value2Modal");
const constructible=    document.getElementById("constructibleToggle");

let defaultValue1 = 32;
let defaultValue2 = 0.1;
let defaultConstructible = true;

// Set default values to inputs
value1Input.value = defaultValue1;
value2Input.value = defaultValue2;
constructible.value = defaultConstructible;
constructible.checked = defaultConstructible;

// Add event listener to button
document.getElementById("saveSettingsButton").addEventListener("click", updateValues);
document.getElementById("saveSettingsButton").addEventListener("click", drawEverything);
document.getElementById("saveSettingsButton").addEventListener("click", updateDisplay);

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
window.addEventListener('resize', () => {
    if (globalC2) {
        drawEverything();
    }
});

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
        'M': 'red',
        'A': 'cyan'
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
    cPScale = scale;

    // Calculate offsets to center the pattern
    const offsetX = (canvasWidth/4) - (width/2)*scale;
    const offsetY = (canvasHeight/2) - (height/2)*scale;
    cPOffsetX = offsetX;
    cPOffSetY = offsetY;

    if (defaultConstructible) {
        drawFrom.push([0, 0, 1, 1, 'A'], [0, 1, 1, 0, 'A'],
            [0, 0, ro.x, ro.y, 'A'], [0, 0, to.x, to.y, 'A'], 
            [0, 1, bo.x, bo.y, 'A'], [0, 1, rt.x, rt.y, 'A'],
            [1, 1, lt.x, lt.y, 'A'], [1, 1, bt.x, bt.y, 'A'],
            [1, 0, lo.x, lo.y, 'A'], [1, 0, tt.x, tt.y, 'A']
        )
    }

    // Scale and translate coordinates
    drawFrom = drawFrom.map(([x1, y1, x2, y2, type]) => [
        (x1 * scale) + offsetX,
        (y1 * scale) + offsetY,
        (x2 * scale) + offsetX,
        (y2 * scale) + offsetY,
        type
    ]);

    const linesA = drawFrom.filter(([x1, y1, x2, y2, type]) => type === 'A');
    const linesMV = drawFrom.filter(([x1, y1, x2, y2, type]) => type === 'M' || type === 'V');
    const linesE = drawFrom.filter(([x1, y1, x2, y2, type]) => type === 'B');
    const linesU = drawFrom.filter(([x1, y1, x2, y2, type]) => type === 'unknown');

    function drawLines (arr) {
        arr.forEach(([x1, y1, x2, y2, type]) => {
            const color = colorMap[type] || 'purple';
            const line = new paper.Path.Line(new paper.Point(x1, y1), new paper.Point(x2, y2));
            line.strokeColor = color;
            if (color === 'cyan') {
                line.strokeWidth = 0.5;
            } else if (color === 'black') {
                line.strokeWidth = 1.5;
            }
        });
    }

    drawLines(linesA);
    drawLines(linesMV);
    drawLines(linesE);
    drawLines(linesU);

    if (globalC2.length > 0 && globalC2[window.variable-1][3].includes('default')) {
        draw(globalC2[window.variable-1][0],globalC2[window.variable-1][1],globalC2[window.variable-1][2],
            globalC2[window.variable-1][3],globalC2[window.variable-1][4],globalC2[window.variable-1][5],globalC2[window.variable-1][6])
    }
}

let cPScale, cPOffsetX, cPOffSetY;

function draw (a, b, c, name, meth, val, elev) {
    let aFinal = a, bFinal = b, cFinal = c;

    const elevationFinal = inverse(aFinal, bFinal, cFinal);
    const elevationFinalCoord = summup(elevationFinal[0], elevationFinal[1], elevationFinal[2])

    rotate = 0;
    searchVi(globalVi, elevationFinalCoord, 10 ** -8, cPScale, cPOffsetX, cPOffSetY);

    let lineArr = [];

    globalC2.forEach(element => {
        let elementA = element[0], elementB = element[1], elementC = element[2];
        let searchValueABC = inverse(elementA, elementB, elementC);
        let searchValue = summup(searchValueABC[0], searchValueABC[1], searchValueABC[2]);

        for (let i = 0; i < globalVi.length; i++) {
            const [x, y] = globalVi[i];

            // Check for y value with tolerance
            if (Math.abs(y - searchValue) < tolerance) {
                lineArr.push([new paper.Point(cPOffsetX, (searchValue * cPScale) + cPOffSetY), 
                    new paper.Point(cPScale + cPOffsetX, (searchValue * cPScale) + cPOffSetY)])
            }

            // Check for x value with tolerance
            if (Math.abs(x - searchValue) < tolerance) {
                lineArr.push([new paper.Point((searchValue * cPScale) + cPOffsetX, cPOffSetY), 
                    new paper.Point((searchValue * cPScale) + cPOffsetX, cPScale + cPOffSetY)])
            }
        }
    })

    lineArr = uniq_fast(lineArr);
   
    lineArr.forEach(element => {
        var magicLine = new paper.Path.Line(element[0], element[1]);
        magicLine.strokeColor = 'green';
        magicLine.strokeWidth = 2;
        magicLine.opacity = 0.1;
        magicLine.onMouseEnter = function(event) {magicLine.opacity = 1};
        magicLine.onMouseLeave = function(event) {magicLine.opacity = 0.1};
        let localxorycommand;

        let c2index;

        for (let i = 0; i < globalC2.length; i++) {
            let sum = summup(globalC2[i][0], globalC2[i][1], globalC2[i][2]);
            let goal = sum ** -1;
            //console.log(goal);

            const s = element[0];
            let reverseSearchVal;
            if ((s.x - cPOffsetX)/cPScale === 0 || (s.x - cPOffsetX)/cPScale === 1) {
                reverseSearchVal = (s.y - cPOffSetY)/cPScale;
                localxorycommand = 'X'
            } else {
                reverseSearchVal = (s.x - cPOffsetX)/cPScale;
                localxorycommand = 'Y'
            }
            //console.log(reverseSearchVal);
    
            if (tolerantSame(reverseSearchVal, goal)) {
                c2index = i;
                break;
            }
        }

        magicLine.onClick = function(event) {
            setWindowVariable(c2index + 1);
            xorycommand = localxorycommand;
            updateDisplay();
            drawEverything();
        };
    });

    scrawler(a, b, c, name, meth);
}

let xorycommand = '';

function isOne(w, h)                {return (Math.abs(w/h - 1) <                    10 ** -8)};
function isRtTwoPlusOne(w, h)       {return (Math.abs(w/h - (Math.SQRT2 + 1)) <     10 ** -8)};
function isRtTwoMinusOne(w, h)      {return (Math.abs(w/h - (Math.SQRT2 - 1)) <     10 ** -8)};
function isOnePlusHalfRtTwo(w,h)    {return (Math.abs(w/h - (1 + Math.SQRT2/2)) <   10 ** -8)};
function isTwoMinusRtTwo(w,h)       {return (Math.abs(w/h - (2 - Math.SQRT2)) <     10 ** -8)};

let elevX = null;
let elevY = null;
let circles = [];

let xory = '';

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
    if ((foundYval.length >= foundXval.length && !xorycommand) || xorycommand === 'X') {
        foundValues = foundYval;
        elevY = new paper.Path.Line(
            new paper.Point(scaleX(0), scaleY(searchValue)),
            new paper.Point(scaleX(1), scaleY(searchValue))
        );
        elevY.strokeColor = '#00ff00';
        elevY.strokeWidth = 2;
        elevY.shadowColor = 'black';
        elevY.shadowBlur = 5;
        xory = 'X';
    } else if ((foundXval.length > foundYval.length && !xorycommand) || xorycommand === 'Y') {
        foundValues = foundXval;
        elevX = new paper.Path.Line(
            new paper.Point(scaleX(searchValue), scaleY(0)),
            new paper.Point(scaleX(searchValue), scaleY(1))
        );
        elevX.strokeColor = '#00ff00';
        elevX.strokeWidth = 2;
        elevX.shadowColor = 'black';
        elevX.shadowBlur = 5;
        xory = 'Y';
        rotate = -90;
    }

    // Draw new circles at found values
    for (let i = 0; i < foundValues.length; i++) {
        let circle = new paper.Path.Circle({
            center: [scaleX(foundValues[i][0]), scaleY(foundValues[i][1])],
            radius: 3,
            fillColor: '#00ff00',
            strokeColor: 'green'
        });

        if (test(foundValues[i][0], foundValues[i][1]) && defaultConstructible) {
            circle.fillColor = 'cyan';
            circle.strokeColor = 'blue'
        }

        circles.push(circle); // Add circle to the list
    }

    if (!found) {
        console.log(`${searchValue} not found within tolerance ${tolerance} in Vi.`);
    }
};

function clearCanvas() {
    if (paper.project) {
        paper.project.activeLayer.removeChildren();
    }
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

    if (EAi.includes(undefined)) {
        alert("File contains at least one duplicate line. This usually happens when an M or V overlays an aux line. These lines will be displayed in purple.");
    }

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
    let C = [];
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

    if (defaultConstructible) {
        function laysOnGrid(element) {
            const index = C.indexOf(element);
            let trutherBucket = [];
            for (let i = 0; i < VC.length; i++) {
                const [s, f] = VC[i];

                const sElement = C[s];
                const fElement = C[f];

                if (Math.abs(sElement - element) < 10 ** -8) {
                    trutherBucket.push(test(element, fElement))
                } else if (Math.abs(fElement - element) < 10 ** -8) {
                    trutherBucket.push(test(sElement, element))
                }
            }
            return trutherBucket.includes(true);
        }

        C = C.filter(laysOnGrid);
    }

    return [C, VC];
}

function test (x,y) {
    return (isOne(x, y) || isOne(x, 1-y) || 
    (Math.abs(x) < 10 ** -8) || (Math.abs(x - 1) < 10 ** -8) || 
    (Math.abs(y) < 10 ** -8) || (Math.abs(y - 1) < 10 ** -8) ||
    isRtTwoPlusOne(x, y) || isRtTwoMinusOne(x, y) || 
    isRtTwoPlusOne(1-x, y) || isRtTwoMinusOne(1-x, y) || 
    isRtTwoPlusOne(x, 1-y) || isRtTwoMinusOne(x, 1-y) || 
    isRtTwoPlusOne(1-x, 1-y) || isRtTwoMinusOne(1-x, 1-y))
} 

// Function to update the display or data structure
function update(target, eps) {
    const { C, VC, EV, EA, FV, C2 } = target;
}

let cIsPowTwoTest = true;

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
                cIsPowTwoTest = false;
            }

            C2.forEach(([a, b, c], index) => {
                const [alpha, beta, gamma] = inverse(a, b, c);
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
    return ((a + (b * Math.SQRT2)) / c)
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

    return normalize(alpha, beta, gamma);
}

function gcd(a, b) {
    if (b) {
        return gcd(b, a % b);
    } else {
        return Math.abs(a);
    }
}

//reduces n and d by their gcd
function simplify(n, d) {
    if (n !== 0 && d !== 0) {
        const gcdND = gcd(n, d);
        n /= gcdND;
        d /= gcdND;
    } else if (n === 0) {
        d = 1;
    } else {
        n = 1;
    }
    return [n, d];
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

function distance (point1, point2) {
    let x1 = point1[0];
    let y1 = point1[1];
    let x2 = point2[0];
    let y2 = point2[1];
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

//pulled from a stackoverflow https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

function isPowerTwo(x) {
    return (Math.log(x) / Math.log(2)) % 1 === 0;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return new paper.Point(x,y);
}

const tolerance = 10 ** -8;

function tolerantSame (value1, value2) {
    return Math.abs(value1 - value2) < tolerance;
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

// Generates the farey sequence of all fractions having a denominator less than or equal to n.
// Each fraction corresponds to a slope.  The lookup table records the number of creases required
// to develop that slope, and the methodology used to do so.

let lookupTable = [];

//most extreme fraction
const m = (1/defaultValue2);

// if b is a power of 2, the reference may be developed in log2(b)+1 folds
function powTwo(b)      {if (isPowerTwo(b))            {return Math.log2(b) + 1}           else {return Infinity}};

function smartDiag(a, b) {
    let gcdAB = gcd(a, b);
    [a, b] = [a / gcdAB, b / gcdAB];

    let i = 1, j = 1, result = null;

    while (i <= 32 && !result) {
        j = 1;
        while (j <= 32 && !result) {
            if (Math.log2(i * a + j * b) % 1 === 0 && Math.log2 (Math.max (i, j)) % 1 === 0) {
                result = [i, j, Math.log2(i * a + j * b)];
                break;
            }
            j++;
        }
        i++;
    }

    let same = Infinity;
    let opp = Infinity;
    
    if (result && result[1] > result[0]) {
        same = Math.log2(2 ** result[2] / gcd(b, 2 ** result[2]));
        opp =  Math.log2(result[1]) + Math.log2(2 ** result[2] / gcd(a, 2 ** result[2]));
    } else if (result) {
        same = Math.log2(2 ** result[2] / gcd(a, 2 ** result[2]));
        opp =  Math.log2(result[0]) + Math.log2(2 ** result[2] / gcd(b, 2 ** result[2]));
    } 

    return Math.min(same, opp) + 2;
}

function general(a,b) {if (!isPowerTwo(b)) {
        let c = Math.ceil(Math.log2(b));
        return Math.log2((2 ** c) / (gcd((2 ** c), a))) + Math.log2((2 ** c) / (gcd((2 ** c), b))) + 1;
    } else {
        return Infinity;
    }
}

function type (a,b) {
    let min = Math.min(powTwo(b), smartDiag(a,b), general(a,b));
    if (powTwo(b)===min){
        return "powTwo";
    } else if (smartDiag(a,b)===min){
        return "smartDiag";
    } else if (general(a,b)===min){
        return "general";
    } else return error
}

function generateFarey () {
    lookupTable = [];
    // Generate the Farey sequence
    for (let b = 1; b <= defaultValue1; b++) {
        for (let a = 0; a <= b; a++) {
            if (gcd(a, b) === 1) {  // Check if gcd(a, b) == 1 (i.e., they are coprime)
                lookupTable.push({ 
                    numerator: a, 
                    denominator: b, 
                    weight: a/b, 
                    rank: Math.min(powTwo(b), smartDiag(a,b), general(a,b)),
                    type: type(a,b),
                },
            );
            }
        }
    }
}

generateFarey();

// Sort the fractions by their value (numerator/denominator)
lookupTable.sort((frac1, frac2) => (frac1.numerator / frac1.denominator) - (frac2.numerator / frac2.denominator));

// Function to search for a specific numerator and denominator
function findRank(numerator, denominator) {
    if (numerator > denominator) {
        [numerator, denominator] = [denominator, numerator];
    }
    if (numerator/denominator < 0 || (numerator < 0 && denominator < 0)) {
        [numerator, denominator] = [-numerator, -denominator]
    }

    let gcdND = gcd(numerator, denominator);
    numerator /= gcdND;
    denominator /= gcdND;

    let result = lookupTable.find(row => row.numerator === numerator && row.denominator === denominator);

    if (numerator === 0 && denominator === 0) {result.rank = Infinity}
    else if (numerator === 0 || denominator === 0) {result.rank = 0}
    else if (numerator/denominator === 1) {result.rank = 1}
    else if (denominator/numerator > m || numerator/denominator > m) {result.rank = Infinity};

    if (result) {return result}
    else {
        console.log(numerator+"/"+denominator)
        console.log(result);
        return null;
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

function rankIt(alphadef, betadef, gammadef, type, callSpot) {
    let alpha, beta, gamma;

    if (type === 'default') {
        [alpha, beta, gamma] = [alphadef, betadef, gammadef];
    } else if (type === 'negdefault') {
        [alpha, beta, gamma] = normalize(( (alphadef * (alphadef - gammadef)) - 2 * betadef ** 2), (-betadef * gammadef), ((alphadef - gammadef) ** 2 - 2 * betadef ** 2))
    } else console.error("unknown type");

    [alpha, beta, gamma] = normalize(alpha, beta, gamma);

    let inputC2 = [];

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
        inputC2.push([alphadef, betadef, gammadef, type, 'A', rankA, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'B', rankB, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'C', rankC, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'D', rankD, [alpha, beta, gamma]])
    }
    if (alpha + beta >= 0 && alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(alpha + beta, gamma);
        const rank2 = searchForFraction(alpha + 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankE = rank1 + rank2 + 3;
        }
        inputC2.push([alphadef, betadef, gammadef, type, 'E', rankE, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'F', rankF, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'G', rankG, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'H', rankH, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'I', rankI, [alpha, beta, gamma]])
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
        inputC2.push([alphadef, betadef, gammadef, type, 'J', rankJ, [alpha, beta, gamma]])
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
    if (callSpot === 'regular') {
        return [minType.name, minType.value];
    } else if (callSpot === 'abcRender') {
        return inputC2;
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
        const rank = rankIt(values[0], values[1], values[2], name, 'regular');
        const negValues = neg(values[0], values[1], values[2]);
        const rankNeg = rankIt(negValues[0], negValues[1], negValues[2], "neg"+name, 'regular');
        
        return [
            { name: name, meth: rank[0], value: rank[1] + rankIncrement, elev: values },
            { name: `neg${name}`, meth: rankNeg[0], value: rankNeg[1] + rankIncrement, elev: negValues }
        ];
    }

    // Default and negdefault
    const defaultType = createRankType('default', [a, b, c]);

    const types = [
        ...defaultType,
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

//----------------------------------------------------------------------------------------------------------------

var bl = new paper.Point(0,            0);
var tl = new paper.Point(0,            1);
var tr = new paper.Point(1,            1);
var br = new paper.Point(1,            0);
var bo = new paper.Point(Math.SQRT2-1, 0);
var bt = new paper.Point(2-Math.SQRT2, 0);
var lo = new paper.Point(0,            Math.SQRT2-1);
var lt = new paper.Point(0,            2-Math.SQRT2);
var ro = new paper.Point(1,            Math.SQRT2-1);
var rt = new paper.Point(1,            2-Math.SQRT2);
var to = new paper.Point(Math.SQRT2-1, 1);
var tt = new paper.Point(2-Math.SQRT2, 1);

let rotation1 = [bo, bt, br, ro, rt, tr, tt, to, tl, lt, lo, bl];

let flip1 = [bt, br, ro, rt, tr, tt, bo, bl, lo, lt, tl, to];

function findTransformation (point) {
    let transArr = [];

    console.log(point);
 
    if (!tolerantSame(point[1], 0)) {

        point[0] -= 0.5, point[1] -= 0.5;

        do {
            [point[0], point[1]] = [-point[1], point[0]];
            transArr.push("rotCC90");
        } while (point[1] !== -0.5)

        point[0] += 0.5, point[1] += 0.5    
    }

    if (!tolerantSame(point[0], bo.x)) {
        transArr.push("flipX")
    }

    console.log(transArr);
    return transArr;
}

function doTransform (point, transArr) {
    //console.log("original point: " + point);
    for (let i = 0; i < transArr.length; i++) {
        if (transArr[i] === 'rotCC90') {
            point[0] -= 0.5, point[1] -= 0.5;
            [point[0], point[1]] = [-point[1], point[0]];
            point[0] += 0.5, point[1] += 0.5;
            //console.log(point);
        } else if (transArr[i] === 'flipX') {
            [point[0], point[1]] = [1-point[0], point[1]];
            //console.log(point);
        }
    }
    //console.log("messed up point: " + point);
    return point;
}

function undoTransform (point, transArr) {
    //console.log("original point: " + point);
    for (let i = transArr.length; i >= 0; i--) {
        if (transArr[i] === 'flipX') {
            [point[0], point[1]] = [1-point[0], point[1]];
            //console.log(point);
        } else if (transArr[i] === 'rotCC90') {
            point[0] -= 0.5, point[1] -= 0.5;
            [point[0], point[1]] = [point[1], -point[0]];
            point[0] += 0.5, point[1] += 0.5;
            //console.log(point);
        }
    }
    //console.log("messed up point: " + point);
    return point;
}

function point (point1) {
    let transArr = findTransformation(point1);
    console.log(transArr);

    let creaseArr = [[tl, br], [tl, bo]];
    let rotatedFlippedCreaseArr = []

    for (let i = 0; i < creaseArr.length; i++) {
        let start = undoTransform([creaseArr[i][0].x, creaseArr[i][0].y], transArr);
        let finish = undoTransform([creaseArr[i][1].x, creaseArr[i][1].y], transArr);
        rotatedFlippedCreaseArr.push([start, finish]);
    }
    
    console.log(rotatedFlippedCreaseArr)

    return rotatedFlippedCreaseArr;
}

function pointPoint (point1, point2) {

    console.log("point1: " + point1);
    console.log("point2: " + point2);

    let transArr = findTransformation(point1);
    console.log(transArr);

    console.log(point2);

    let point2new = doTransform(point2, transArr);
    console.log(point2new);
    
    for (let i = 0; i < rotation1.length; i ++) {
        if (tolerantSame(point2new[0], rotation1[i].x) && tolerantSame(point2new[1], rotation1[i].y)) {
            point2new = rotation1[i];
            break;
        }
    }

    let creaseArr = [[tl, br], [tl, bo]];

    switch(point2new) {
        case bo:
            break;
        case bt:
            creaseArr.push ([bl, tr], [tr, bt]);
            break;
        case ro:
            creaseArr.push ([bl, ro]);
            // perp symbol
            break;
        case rt:
            creaseArr.push ([tl, rt]);
            break;
        case tt:
            creaseArr.push ([br, tt]);
            break;
        case to:
            creaseArr.push ([to, bo]);
            break;
        case lt:
            creaseArr.push ([lt, tr]);
            //perp symbol
            break;
        case lo:
            creaseArr.push ([lo, br]);
            break;   
    }
    
    console.log(creaseArr);

    let rotatedFlippedCreaseArr = []

    for (let i = 0; i < creaseArr.length; i++) {
        let start = undoTransform([creaseArr[i][0].x, creaseArr[i][0].y], transArr);
        let finish = undoTransform([creaseArr[i][1].x, creaseArr[i][1].y], transArr);
        rotatedFlippedCreaseArr.push([start, finish]);
    }
    
    console.log(rotatedFlippedCreaseArr);

    return rotatedFlippedCreaseArr;
}

function pointLine (point1, point2, point3) {
    let point, lineS, lineF;

    if (lineTest(point1, point2)) {
        point = point3;
        lineS = point1;
        lineF = point2;
    } else if (lineTest(point2, point3)) {
        point = point1;
        lineS = point2;
        lineF = point3;
    } else if (lineTest(point1, point3)) {
        point = point2;
        lineS = point1;
        lineF = point3;
    } else {
        console.error("It's not pointLine");
    }

    let transArr = findTransformation(point);
    console.log(transArr);

    let lineS2 = doTransform(lineS, transArr);
    
    console.log(lineS2);
    
    let lineF2 = doTransform(lineF, transArr);
    
    console.log(lineF2);

    let creaseArr = [[tl, br], [tl, bo]];

    if (tolerantSame(lineS2[0], lineF2[0])) {
        console.log('A');
        if (tolerantSame(lineS2[0], bo.x)) {
            console.log('B');
            creaseArr.push([bo, to]);
        } else if (tolerantSame(lineS2[0], bt.x)) {
            console.log('C');
            creaseArr.push([bt, tt], [tt, br]);
        }
    } else if (tolerantSame(lineS2[1], lineF2[1])) {
        console.log('D');
        if (tolerantSame(lineS2[1], lo.y)) {
            console.log('E');
            creaseArr.push([lo, ro], [lo, br]);
        } else if (tolerantSame(lineS2[1], lt.y)) {
            console.log('F');
            creaseArr.push([bo, to], [lt, rt]);
        }
    }
    
    console.log(creaseArr);

    let rotatedFlippedCreaseArr = [];

    for (let i = 0; i < creaseArr.length; i++) {
        let start = undoTransform([creaseArr[i][0].x, creaseArr[i][0].y], transArr);
        let finish = undoTransform([creaseArr[i][1].x, creaseArr[i][1].y], transArr);
        rotatedFlippedCreaseArr.push([start, finish]);
    }
    
    console.log(rotatedFlippedCreaseArr);

    return rotatedFlippedCreaseArr;
}

function lineTest (point1, point2) {
    return ((tolerantSame(point1[0], point2[0]) || tolerantSame(point1[1], point2[1])) && tolerantSame(distance(point1, point2), 1))
}

function lineLine (point1, point2, point3, point4) {
    let line1S, line1F, line2S, line2F;

    if (lineTest(point1, point2)) {
        line1S = point1, line1F = point2, line2S = point3, line2F = point4;
    } else if (lineTest(point1, point3)) {
        line1S = point1, line1F = point3, line2S = point2, line2F = point4;
    } else if (lineTest(point1, point4)) {
        line1S = point1, line1F = point4, line2S = point2, line2F = point3;
    } else {
        console.error("It's not lineLine");
    }

    let transArr = findTransformation(line1S);

    let line1F2 = doTransform(line1F, transArr);
    
    let line2S2 = doTransform(line2S, transArr);
    
    let line2F2 = doTransform(line2F, transArr);

    let creaseArr = [];

    if (tolerantSame(line2S2[0], line2F2[0])) {
        if (tolerantSame(line2S2[0], bt.x)) {
            creaseArr = [[tl, br], [tl, bo], [bo, to], [br, tt], [tt, bt]];
        }
    } else if (tolerantSame(line2S2[1], line2F2[1])) {
        if (tolerantSame(line2S2[1], lo.y)) {
            creaseArr = [[bl, tr], [bl, to], [to, bo], [lo, ro]];
        } else if (tolerantSame(line2S2[1], lt.y)) {
            creaseArr = [[tl, br], [tl, bo], [lt, rt], [bo, to]];
        }
    }

    let rotatedFlippedCreaseArr = [];

    for (let i = 0; i < creaseArr.length; i++) {
        let start = undoTransform([creaseArr[i][0].x, creaseArr[i][0].y], transArr);
        let finish = undoTransform([creaseArr[i][1].x, creaseArr[i][1].y], transArr);
        rotatedFlippedCreaseArr.push([start, finish]);
    }

    return rotatedFlippedCreaseArr;

}

function findCreaseArr (arr) {
    let creaseArr;

    arr = arr.flat();

    let cleanArray = [];

    arr.forEach((point, index) => {
        if (point instanceof paper.Point) {
            cleanArray.push([point.x, point.y])
        } else {
            console.error(`Element ${index} is not a paper.Point`);
        }
    });

    console.log(cleanArray);    

    switch(cleanArray.length) {
        case 1:
            console.log("point");
            creaseArr = point(cleanArray[0])
            break;
        case 2:
            console.log("pointPoint");
            creaseArr = pointPoint(cleanArray[0], cleanArray[1]);
            break;
        case 3:
            console.log("pointLine");
            creaseArr = pointLine(cleanArray[0], cleanArray[1], cleanArray[2]);
            break;
        case 4:
            console.log("lineLine");
            creaseArr = lineLine(cleanArray[0], cleanArray[1], cleanArray[2], cleanArray[3]);
            break;
    }

    return creaseArr;
}

function linePusher(arr, boxArr, time) {
    for (let i = 0; i < arr.length; i++) {

        console.log(arr);
        console.log(arr[i].length);

        // Ensure that arr[i] is an array with two points
        if (arr[i].length === 2) {
            const point1 = new paper.Point(arr[i][0][0], arr[i][0][1]);
            const point2 = new paper.Point(arr[i][1][0], arr[i][1][1]);
            var lineToBePushed = new paper.Path.Line(point1, point2);

            console.log(point1);
            console.log(point2);

            if (!(point1.x === point2.x && point1.y === point2.y)) {
                boxArr.addChild(lineToBePushed);
                lineToBePushed.strokeColor = time === 0 ? 'red' : 'black';
                lineToBePushed.strokeWidth = 1;
                lineToBePushed.pivot = new paper.Point(0.5, 0.5);
                //lineToBePushed.rotate = rotate;
            }
        } else {
            console.error("Invalid array format for line:", arr[i]);
        }
    };
}

let scale;

function dot(point, time) {
    return new paper.Path.Circle({
        center: point,
        radius: 2.5/scale,
        fillColor: 'black',
        visible: time === 0
    });
}

function highLighter (from, to, time) {
    var fromDot = dot(from, time);
    var toDot = dot(to, time);
    var line = new paper.Path.Line({
        from: from,
        to: to,
        strokeColor: 'black',
        strokeWidth: 1,
        shadowBlur: 4,
        shadowColor: 'yellow',
        visible: time === 0
    })
    let highLightLine = new paper.Group(fromDot, toDot, line);

    console.log(`highlighter called.  time: ${time}`);

    return highLightLine;
}

let fontSize;

//a pair of numbers are scaled so that the larger equals one, but proportionality is maintained
function scaler(n, d) {
    const maxND = Math.max(n, d);
    n /= maxND;
    d /= maxND;
    return [n, d];
}

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
            blockInfo = [1, 2 - Math.SQRT2];
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

    console.log([slopePair, blockInfo]);

    let approxRank = findRank(slopePair[0], slopePair[1]).rank + findRank(slopePair[2], slopePair[3]).rank;

    return [slopePair, blockInfo, approxRank];
};

let rotate = 0;

function scrawler(a, b, c, method, split) {
    // Get the canvas size
    const canvas = document.getElementById('myCanvas');
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Adjust the step size based on the canvas dimensions
    const stepSize = Math.min(canvasHeight / 2, canvasWidth / 6) * 0.8;

    scale = stepSize;

    fontSize = 12/stepSize;

    const y1 = canvasHeight / 2 - canvasWidth / 12 - stepSize / 2, y2 = canvasHeight / 2 - stepSize / 2, y3 = canvasHeight / 2 + canvasWidth / 12 - stepSize / 2;

    const x1 = 7 * canvasWidth / 12 - stepSize / 2, x2 = 2 * canvasWidth / 3 - stepSize / 2, x3 = 3 * canvasWidth / 4 - stepSize / 2, x4 = 5 * canvasWidth / 6 - stepSize / 2, x5 = 11 * canvasWidth / 12 - stepSize / 2;

    const stepper = [
        [[x3, y2]], 
        [[x2, y2], [x4, y2]], 
        [[x1, y2], [x3, y2], [x5, y2]],
        [[x2, y1], [x4, y1], [x2, y3], [x4, y3]],
        [[x1, y1], [x3, y1], [x5, y1], [x2, y3], [x4, y3]],
        [[x1, y1], [x3, y1], [x5, y1], [x1, y3], [x3, y3], [x5, y3]]
    ];

    updateInfoText();

    function borderFactory(numSteps) {
        const border = new paper.Path.Rectangle({
            from: new paper.Point(stepData[numSteps][0], stepData[numSteps][1]),
            to: new paper.Point(stepData[numSteps][0] + stepSize, stepData[numSteps][1] + stepSize),
            strokeColor: 'black',
            strokeWidth: 1,
            pivot: new paper.Point(0.5, 0.5)
        });
        return border;
    }

    let screen = new paper.Group();

    console.log(`*** Begin drawing elev. ${window.variable} ***`);

    let whiteRabbit = newDiags(a, b, c, method, split);
    //console.log(whiteRabbit);

    const stepCount = whiteRabbit.steps.length;
    const stepData = stepper[stepCount - 1];

    for (let i = 0; i < stepCount; i++) {
        let thisStep = whiteRabbit.steps[i][0];

        for (let j = 0; j < i; j ++) {
            thisStep.addChild(whiteRabbit.steps[j][1].clone());
        }

        thisStep.pivot = new paper.Point(0.5, 0.5);
        thisStep.scale(stepSize, stepSize);
        thisStep.position = new paper.Point(stepData[i][0] + stepSize / 2, stepData[i][1] + stepSize / 2);
        thisStep.strokeWidth = 1;
        thisStep.rotation = rotate;

        thisStep.children.forEach((child) => {
            if (child instanceof paper.PointText) {
                child.rotation = 0;
            }
        });

        borderFactory(i);

        screen.addChild(thisStep);
    }
}

function diag (a, b, w, h, time, diag2) {
    [a,b] = simplify(a,b);

    console.log(`a: ${a}, b: ${b}, ${findRank(a, b)}`)
    
    let type = findRank(a, b).type;

    console.log(type);

    switch (type) {
        case 'powTwo':
            return powTwoFunction   (a, b, w, h, time, diag2);
        case 'general':
            return generalFunction  (a, b, w, h, time, diag2);
        case 'smartDiag':
            return diagFunction     (a, b, w, h, time, diag2);
    }
}

//returns [powtwogroup, powtwoprelim]
function powTwoFunction (a, b, w, h, time, diag2) {

    [w, h] = scaler(w, h);
    [a, b] = simplify(a, b);

    var bbl = new paper.Point(0, 0);
    var bbr = new paper.Point(w, 0);
    var btr = new paper.Point(w, h);
    var btl = new paper.Point(0, h);

    let timeColor = time === 0 ? 'red' : 'black';
    var creaseStyle = {
        strokeColor: timeColor,
        strokeWidth: 1,
        visible: time >= 0
    }

    var cstart = bbl;
    var csquare = new paper.Point(a * w, b * h);
    [csquare.x, csquare.y] = scaler(csquare.x, csquare.y);
    var creasePowTwo = new paper.Path(cstart, csquare);
    creasePowTwo.style = creaseStyle;

    let powTwoHighLight, powTwoDot, powTwoDotPt, powTwoLabelText, powTwoBlockDot, powTwoTextPt;
    let powTwoTextJust = 'center';

    let powTwoPrelim = [];

    if (isPowerTwo(Math.max(a,b))) {
        if (tolerantSame(w, h)) {
            console.log("square, powTwo");
            powTwoDotPt = csquare;
            powTwoDot = dot(csquare, time);
            powTwoLabelText = `${Math.min(a,b)}/${Math.max(a,b)}`;
            powTwoTextPt = csquare.clone();
            if (a < b) {
                powTwoHighLight = highLighter(btl, btr, time);
                powTwoTextPt.y += fontSize;
            } else if (a > b) {
                powTwoHighLight = highLighter(btr, bbr, time);
                powTwoTextJust = 'left'
            } else {
                powTwoTextPt.y += fontSize;
            }
        } else {
            console.log("not square, powTwo");
            powTwoPrelim.push(btr);
            if (a < b) {
                powTwoHighLight = highLighter(btl,btr,time);
                powTwoDotPt = new paper.Point(w*a/b, h);
                powTwoLabelText = `${a}/${b}`;
                powTwoTextPt = powTwoDotPt.clone();
                powTwoTextPt.y += fontSize;
                if (w > h) {
                    powTwoPrelim.push(btl);
                    console.log("a<b, w>h");
                };
            } else if (a > b) {
                powTwoHighLight = highLighter(btr,bbr,time);
                powTwoDotPt = new paper.Point(w,h*b/a);
                powTwoLabelText = `${b}/${a}`;
                powTwoTextPt = powTwoDotPt.clone();
                powTwoTextJust = 'left';
                if (w < h) {
                    powTwoPrelim.push(bbr);
                    console.log("a>b, w<h")
                };
            }
            powTwoDot = dot(powTwoDotPt, time);
        }
        if (a === b) {powTwoLabelText = ''};
    } else console.error("Not powTwo")

    var powTwoLabel = new paper.PointText({
        point: powTwoTextPt,
        content: powTwoLabelText,
        fontSize: fontSize,
        fillColor: 'black',
        justification: powTwoTextJust,
        visible: time === 0
    })
      
    var validPowTwoItems = [creasePowTwo, powTwoHighLight, powTwoLabel, powTwoDot]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var powTwoGroup = new paper.Group(validPowTwoItems);

    console.log(powTwoPrelim);

    powTwoGroup.pivot = new paper.Point(0.5, 0.5);

    if (diag2) {
        powTwoGroup.scale(-1, 1);
        powTwoPrelim.forEach(element => {
            element.x = 1 - element.x;
        });
        powTwoLabel.scale(-1,1);
    }
    console.log(powTwoPrelim);
    console.log(powTwoLabel);
    console.log(powTwoHighLight);
    console.log(powTwoDot);

    //powTwoGroup.rotate(rotate);
    powTwoLabel.rotation = 0;

    const powTwoReturn = {
        drawnGroup: powTwoGroup,
        pointsPrelim: powTwoPrelim,
        rank: Math.log2(Math.max(a, b)) + 1,
        diagonal: [diag2 ? 1 - cstart.x : cstart.x, cstart.y, diag2 ? 1- csquare.x : csquare.x, csquare.y]
    }

    return powTwoReturn;
}

function generalFunction (a, b, w, h, time, diag2) {
    let tall = h > w;
    let wide = w > h;
    let square = tolerantSame(w, h);

    let timeColor = time === 0 ? 'red' : 'black';
    var creaseStyle = {
        strokeColor: timeColor,
        strokeWidth: 1,
    };
    
    [w, h] = scaler(w, h);

    [a, b] = simplify(a, b);

    var bbl = new paper.Point(0, 0);
    var bbr = new paper.Point(w, 0);
    var btr = new paper.Point(w, h);
    var btl = new paper.Point(0, h);

    var cstart = bbl;
    var csquare = new paper.Point(a * w, b * h);
    [csquare.x, csquare.y] = scaler(csquare.x, csquare.y);
    var creaseGen = new paper.Path(cstart, csquare);
    creaseGen.style = creaseStyle;

    const smallestPowTwo = 2 ** Math.ceil(Math.log2(Math.max(a, b)));

    let vertX = w*a/smallestPowTwo;
    let horiY = h*b/smallestPowTwo;

    var genInt = new paper.Point(vertX, horiY);
    var genIntPt = dot(genInt);

    let vertY = 0;
    let horiX = 0;
    let vertTexY = vertY;
    
    let horiJust = 'right';
    let vertJust = 'center';
    
    let horiHighLightStart = new paper.Point(0,0);
    let vertHighLightStart = new paper.Point(0,0);
    let horiHighLightFinish = new paper.Point(w,0);
    let vertHighLightFinish = new paper.Point(0,h);

    let horiNear = true;
    let vertNear = true;

    if (square) {
        horiNear = a <= smallestPowTwo/2;
        vertNear = b <= smallestPowTwo/2;
    } else if (wide) {
        horiNear = a <= smallestPowTwo/2;
    } else if (tall) {
        vertNear = b <= smallestPowTwo/2;
    }

    let generalPrelim = [];

    if (tall) {
        if (vertNear) {
            generalPrelim.push(bbr);
        } else generalPrelim.push(btr);
    } else if (wide) {
        if (horiNear) {
            generalPrelim.push(btl);
        } else generalPrelim.push(btr);
    }

    if (!horiNear) {
        horiX = 1;
        horiJust = 'left';
        vertHighLightStart.x = 1;
        vertHighLightFinish.x = 1;
    } else {
        horiX = 0;
    }

    if (!vertNear) {
        vertY = 1;
        vertTexY = 1;
        vertTexY += fontSize;
        horiHighLightStart.y = 1;
        horiHighLightFinish.y = 1;
    } else {
        vertY = 0;
        vertTexY -= fontSize;
    }

    let generalA = a;
    let generalB = b;
    let generalADenom = smallestPowTwo;
    let generalBDenom = smallestPowTwo;
    
    [generalA, generalADenom] = simplify(generalA, generalADenom);
    [generalB, generalBDenom] = simplify(generalB, generalBDenom);
    let vertTextLabel = `${generalA}/${generalADenom}`;
    let horiTextLabel = `${generalB}/${generalBDenom}`;

    var vertStart = new paper.Point(vertX, vertY);
    var horiStart = new paper.Point(horiX, horiY);
    
    var vertLine = new paper.Path(vertStart, genInt);
    vertLine.style = creaseStyle;
    var horiLine = new paper.Path(horiStart, genInt);
    horiLine.style = creaseStyle;
    let vertDot = dot(vertStart, time);
    let horiDot = dot(horiStart, time);
    let vertHighLight = highLighter(vertHighLightStart, vertHighLightFinish, time);
    let horiHighLight = highLighter(horiHighLightStart, horiHighLightFinish, time);

    let horiText = new paper.PointText({
        point: new paper.Point(horiX, horiY),
        content: horiTextLabel,
        fillColor: 'black',
        fontSize: fontSize,
        justification: horiJust,
        visible: time === 0
    });

    let vertText = new paper.PointText({
        point: new paper.Point(vertX, vertTexY),
        content: vertTextLabel,
        fillColor: 'black',
        fontSize: fontSize,
        justification: vertJust,
        visible: time === 0
    });

    var validGenItems = [creaseGen, vertHighLight, horiHighLight, vertDot, horiDot, vertLine, horiLine, genIntPt, vertText, horiText]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var genGroup = new paper.Group(validGenItems);

    genGroup.pivot = new paper.Point(0.5, 0.5);

    if (diag2) {
        genGroup.scale(-1, 1);
        generalPrelim.forEach(element => {
            element.x = 1 - element.x;
        });
        vertText.scale(-1,1);
        horiText.scale(-1,1);
    }

    //genGroup.rotate(rotate);
    vertText.rotation = 0;
    horiText.rotation = 0;
    
    const genReturn = {
        drawnGroup: genGroup,
        pointsPrelim: generalPrelim,
        rank: general(a, b),
        diagonal: [diag2 ? 1 - cstart.x : cstart.x, cstart.y, diag2 ? 1- csquare.x : csquare.x, csquare.y]
    }

    return genReturn;
}

function diagFunction (a, b, w, h, time, diag2) {

    let timeColor = time === 0 ? 'red' : 'black';
    var creaseStyle = {
        strokeColor: timeColor,
        strokeWidth: 1,
        visible: time >= 0
    };
    
    [w, h] = scaler(w, h);
    [a, b] = simplify(a, b);
    
    var bbl = new paper.Point(0, 0);
    var bbr = new paper.Point(w, 0);
    var btl = new paper.Point(0, h);

    var cstart = bbl.clone();
    var csquare = new paper.Point(a * w, b * h);
    
    [csquare.x, csquare.y] = scaler(csquare.x, csquare.y);
    
    var creaseDiag = new paper.Path(cstart, csquare);
    creaseDiag.style = creaseStyle;

    var diagStart = btl.clone();
    var diagFinish = bbr.clone();
    let diagNumA = a, diagNumB = b, diagDenom = Math.max(a,b);
    let diagLabelPt = bbl.clone();
    let diagLabelText = '';

    let diagLabelSide;

    let i = 1, j = 1, result = null;

    while (i <= 32 && !result) {
        j = 1;
        while (j <= 32 && !result) {
            if (Math.log2(i * a + j * b) % 1 === 0 && Math.log2 (Math.max (i, j)) % 1 === 0) {
                result = [i, j, Math.log2(i * a + j * b)];
                break;
            }
            j++;
        }
        i++;
    }
    
    console.log(result);
    console.log([a, b]);

    [i, j] = simplify(result[0], result[1]);
    diagStart.y = i/Math.max(i, j) * h;
    diagFinish.x = j/Math.max(i, j) * w;
    
    if (i > j) {
        diagLabelPt.x = w * j/i;
        diagLabelText = `${j}/${i}`;
        diagLabelSide = 'bottom';
    } else if (i < j) {
        diagLabelPt.y = h * i/j;
        diagLabelText = `${i}/${j}`;
        diagLabelSide = 'left';
    }
   
    let diagInt = intersect(diagStart.x, diagStart.y, diagFinish.x, diagFinish.y, cstart.x, cstart.y, csquare.x, csquare.y);
    let diagIntDot = dot(diagInt, time);
    var parallelStart = bbl.clone();
    let parallelText  = '';
    var highLightX = highLighter(bbl, bbr, time);
    var highLightY = highLighter(bbl, btl, time);

    let diagDot = dot(diagLabelPt, time);
    let diagDenomA = i*a + j*b, diagDenomB = i*a + j*b;
    [diagNumA, diagDenomA] = simplify(diagNumA, diagDenomA);
    [diagNumB, diagDenomB] = simplify(diagNumB, diagDenomB);

    let parallelLabelPt;
    let parallelLabelJust = 'center';

    let diagPrelim = [];

    if (!tolerantSame(diagFinish.x, diagStart.y)) {
        if (diagFinish.x > diagStart.y){
            parallelStart.x = diagInt.x;
            parallelText = `${diagNumA}/${diagDenomA}`;
            parallelLabelPt = parallelStart.clone();
            parallelLabelPt.y -= fontSize;
            console.log("hereA");
        } else if (diagFinish.x < diagStart.y){
            parallelStart.y = diagInt.y;
            parallelText = `${diagNumB}/${diagDenomB}`;
            parallelLabelPt = parallelStart.clone();
            parallelLabelJust = 'right';
            console.log("hereB")
        }
    } else {
        if (a*w >= b*h) {
            parallelStart.x = diagInt.x;
            parallelText = `${diagNumA}/${diagDenomA}`;
            parallelLabelPt = parallelStart.clone();
            parallelLabelPt.y -= fontSize;
            console.log("here1");
        } else {
            parallelStart.y = diagInt.y;
            parallelText = `${diagNumB}/${diagDenomB}`;
            parallelLabelPt = parallelStart.clone();
            parallelLabelJust = 'right';
            console.log("here2");
        }
    }

    if (i === j) {
        diagDot = false;
        if (parallelStart.x === diagInt.x) {
            highLightY = false;
        } else if (parallelStart.y === diagInt.y) {
            highLightX = false;
        }
    }
    
    let parallelDot = dot(parallelStart, time);
    var parallelLine = new paper.Path(parallelStart, diagInt);
    parallelLine.style = creaseStyle;

    let diagJust;
    if (diagLabelSide === 'left') {diagJust = 'right'} else {diagJust = 'center'};
    if (diagLabelSide === 'bottom') {diagLabelPt.y -= fontSize};
    
    console.log(diagLabelText);

    var diagText = new paper.PointText({
        point: diagLabelPt,
        content: diagLabelText,
        fillColor: 'black',
        fontSize: fontSize,
        justification: diagJust,
        visible: time === 0
    })
    
    console.log(diagText);

    var parallelTextObj = new paper.PointText({
        point: parallelLabelPt,
        content: parallelText,
        fillColor: 'black',
        fontSize: fontSize,
        justification: parallelLabelJust,
        visible: time === 0
    })

    let diagLine = new paper.Path(diagStart, diagFinish);
    diagLine.style = creaseStyle;
    
    let anotherDot;
    if (w > h) {
        anotherDot = dot(new paper.Point(0, h), time);
        diagPrelim.push(btl);
    } else if (h > w) {
        anotherDot = dot(new paper.Point(w, 0), time);
        diagPrelim.push(bbr);
    }
    
    var validDiagItems = [creaseDiag, anotherDot, highLightX, highLightY, parallelLine, diagIntDot, diagLine, diagDot, parallelDot, parallelTextObj, diagText]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var diagGroup = new paper.Group(validDiagItems);

    diagGroup.pivot = new paper.Point(0.5, 0.5);

    if (diag2) {
        diagGroup.scale(-1, 1);
        diagPrelim.forEach(element => {
            element.x = 1 - element.x;
        });
        parallelTextObj.scale(-1,1);
        diagText.scale(-1,1);
    }

    diagGroup.visible = time >= 0;

    //diagGroup.rotate(rotate);
    parallelTextObj.rotation = 0;
    diagText.rotation = 0;
    
    const diagReturn = {
        drawnGroup: diagGroup,
        pointsPrelim: diagPrelim,
        rank: smartDiag(a,b),
        diagonal: [diag2 ? 1 - cstart.x : cstart.x, cstart.y, diag2 ? 1- csquare.x : csquare.x, csquare.y]
    }

    return diagReturn;
}

function oneZero (one1, one2, zero1, zero2, w1, h1, w2, h2) {
    let pointBucket = [];
    let int = [];
    let interPt;
    console.log("calling oneZero");
    if (one1 && one2) {
        if (isOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([bl,tr],[tl,br],[br,tt]);
                int = [bl, tr, br, tt];
                console.log("A, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([bl,tr], [bl,to], [br,to]);
                int = [bl, tr, br, lo];
                console.log("B, one & one");
            }
        } else if (isOne(w2, h2)) {
            if (isOnePlusHalfRtTwo(w1, h1)) {
                pointBucket.push([tl,br], [tl,rt], [bl,rt]);
                int = [tl, br, bl, rt];
                console.log("C, one & one");
            } else if (isRtTwoPlusOne(w1, h1)) {
                pointBucket.push([tl,br], [bl,ro], [bl,tr]);
                int = [tl, br, bl, ro];
                console.log("D, one & one");
            }
        } else if (isRtTwoPlusOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([bl,tr],[bl,ro],[tt,br]);
                int = [bl, ro, tt, br];
                //perp symbol
                console.log("G, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([bl,tr], [bl,to],[bl,ro],[to,br]);
                int = [bl, ro, to, br];
                console.log("I, one & one");
            } else if (isOnePlusHalfRtTwo(w2, h2)) {
                pointBucket.push([bl,tr],[bl,ro],[tr,lt],[lt,br]);
                int = [bl, ro, lt, br];
                console.log("J, one & one");
            }
        } else if (isOnePlusHalfRtTwo(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([tl,br],[tl,rt],[br,tt],[bl,rt]);
                int = [bl, rt, br, tt];
                console.log("F, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([tl,br], [tl,rt], [bl,rt],[to,br]);
                int = [bl, rt, to, br];
                //perp symbol
                console.log("H, one & one");
            }
        }
        const intArr = int.flatMap(point => [point.x, point.y]);
        interPt = intersect(...intArr);
    } else if (zero1 || zero2) {
        if (one1 && isRtTwoPlusOne(w1, h1)) {
            pointBucket.push([bl,tr],[bl,ro]);
            interPt = ro.clone();
            console.log("zero & one(rt2+1)");
        } else if (one2 && isRtTwoPlusOne(w2, h2)) {
            pointBucket.push([br,tl],[br,lo]);
            interPt = lo.clone();
            console.log("zero & one(rt2+1)");
        } else if (one1 && isOnePlusHalfRtTwo(w1, h1)) {
            pointBucket.push([tl,br],[tl,rt]);
            interPt = rt.clone();
            console.log("zero & one(1+rt2/2)")
        } else if (one2 && isOnePlusHalfRtTwo(w2, h2)) {
            pointBucket.push([bl,tr],[tr,lt]);
            interPt = lt.clone();
            console.log("zero & one(1+rt2/2)")
        }
    }

    const result = pointBucket.map(pair => {
        return pair.map(point => [point.x, point.y]);
    });

    return [result, interPt];
}

function newDiags (a, b, c, method, split) {
    let [aInt, bInt, cInt] = [a, b, c];

    if (method.includes('neg')) {
        [aInt, bInt, cInt] = normalize(a * (a - c) - 2 * b ** 2, -b * c, (a - c) ** 2 - 2 * b ** 2);
    }

    const powerArr = sloper(aInt, bInt, cInt, split);

    const [a1, b1, a2, b2] = powerArr[0];

    let [w1, w2] = powerArr[1];
    let [h1, h2] = [1,1];
    [w1, h1] = scaler (w1, h1);
    [w2, h2] = scaler (w2, h2);

    const zero1 = (a1 === 0 || b1 == 0), zero2 = (a2 === 0 || b2 === 0), one1 = (a1 === b1), one2 = (a2 === b2);

    var c1S = new paper.Point();
    var c1F = new paper.Point();
    var c2S = new paper.Point();
    var c2F = new paper.Point();

    let precreaseStep0 = new paper.Group(), diag1Step0, 
        diag2Step0 = new paper.Group(), intStep0 = new paper.Group(),
        precreaseStep1 = new paper.Group(), diag1Step1 = new paper.Group(), 
        diag2Step1 = new paper.Group(), intStep1 = new paper.Group();

    let preCreaseLineArr = [], preCreaseArr = [], interPt;
    let steps = [], rank = 0;

    const styleTime0 = {
        strokeColor: 'red',
        strokeWidth: 1
    }

    const styleTime1 = {
        strokeColor: 'black',
        strokeWidth: 1
    }

    let diag10obj, diag11obj;
    diag10obj = diag (a1, b1, w1, h1, 0, false);
    diag11obj = diag (a1, b1, w1, h1, 1, false);
    let diag20obj, diag21obj;
    diag20obj = diag (a2, b2, w2, h2, 0, true);
    diag21obj = diag (a2, b2, w2, h2, 1, true);

    if ((one1 || zero1) && (one2 || zero2)) {
        //handles 1/1 & 1/0
        console.log("onezero");
        [preCreaseLineArr, interPt] = oneZero(one1, one2, zero1, zero2, w1, h1, w2, h2);
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);
    
        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)
    
        //not sure if this will work...
        rank = precreaseStep1._children.length + 1;
    
        steps = [[precreaseStep0, precreaseStep1], [intStep0, intStep1]];
    } else if (one1 || one2) {
        //handles 1/2      
        console.log("onetwo");
        if (one1) {
            console.log("one1");
            [c1S.x, c1S.y, c1F.x, c1F.y] = [0, 0, w1, h1];
            preCreaseArr.push(new paper.Point(w1, h1));
            preCreaseLineArr.push([[0,0],[w1,h1]]);
            [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
            interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);
            preCreaseArr.push (...diag10obj.pointsPrelim);
    
            diag2Step0 = diag20obj.drawnGroup;
            diag2Step1 = diag21obj.drawnGroup;
    
            uniq_fast(preCreaseArr);
            if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
            uniq_fast(preCreaseLineArr);
            linePusher(preCreaseLineArr, precreaseStep0, 0);
            linePusher(preCreaseLineArr, precreaseStep1, 1);
    
            let interDot = dot(interPt, 0);
            let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
            interLine0.style = styleTime0;
            let interLine1 = interLine0.clone();
            interLine1.style = styleTime1;
            intStep0 = new paper.Group (interDot, interLine0);
            intStep1 = new paper.Group (interLine1);

            diag1Step0 = null;
    
            rank = precreaseStep1._children.length + diag21obj.rank + 1;
        } else {
            console.log("one2");
            [c2S.x, c2S.y, c2F.x, c2F.y] = [1, 0, 1-w2, h2];
            preCreaseArr.push(new paper.Point(1-w2, h2)); //needs to be point
            preCreaseLineArr.push([[1,0],[1-w2,h2]]);
    
            [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
            interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);
            preCreaseArr.push(...diag10obj.pointsPrelim); //needs to be spread
    
            diag1Step0 = diag10obj.drawnGroup;
            diag1Step1 = diag11obj.drawnGroup;
    
            uniq_fast(preCreaseArr);
            console.log(preCreaseLineArr);
            if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
            uniq_fast(preCreaseLineArr);
            linePusher(preCreaseLineArr, precreaseStep0, 0);
            linePusher(preCreaseLineArr, precreaseStep1, 1);
    
            let interDot = dot(interPt, 0);
            let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
            interLine0.style = styleTime0;
            let interLine1 = interLine0.clone();
            interLine1.style = styleTime1;
            intStep0 = new paper.Group (interDot, interLine0);
            intStep1 = new paper.Group (interLine1);

            diag2Step0 = null;
    
            rank = precreaseStep1._children.length + diag11obj.rank + 1;
        }
    
        if (precreaseStep0) {steps.push([precreaseStep0, precreaseStep1])};
        if (diag1Step0)     {steps.push([diag1Step0, diag1Step1])};
        if (diag2Step0)     {steps.push([diag2Step0, diag2Step1])};
        if (intStep0)       {steps.push([intStep0, intStep1])};
    
    } else if (zero1 || zero2) {
        //handles 0/2 (need powTwo case)
        console.log("twozero");
        if (zero1) {
            console.log("zero1");
            [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
            interPt = c2F.clone();
            preCreaseArr.push (...diag20obj.pointsPrelim);
            
            diag2Step0 = diag20obj.drawnGroup;
            diag2Step1 = diag21obj.drawnGroup;
    
            if (!tolerantSame (w2, h2) && findCreaseArr(preCreaseArr)) {
                preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
                linePusher(preCreaseLineArr, precreaseStep0, 0);
                linePusher(preCreaseLineArr, precreaseStep1, 1);
            } else precreaseStep0 = null;
    
            let interDot = dot(interPt, 0);
            let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
            interLine0.style = styleTime0;
            let interLine1 = interLine0.clone();
            interLine1.style = styleTime1;
            intStep0 = new paper.Group (interDot, interLine0);
            intStep1 = new paper.Group (interLine1)
    
            if (findRank(a2, b2).type === 'powTwo' && (a2 > b2 === w2 > h2 || tolerantSame (w2, h2))) {
                console.log("powtwo");
                if (tolerantSame (w2, h2)) {
                    console.log("square");
                    precreaseStep0 = null, precreaseStep1 = null;
                    intStep0 = null, intStep1 = null;
                    diag2Step0._children[0].visible = false;
                    diag2Step1._children[0].visible = false;
                    diag2Step0.addChild(interLine0);
                    diag2Step1.addChild(interLine1);
    
                    rank = diag21obj.rank;
                    steps = [[diag2Step0, diag2Step1]];
                } else if (a2 > b2 === w2 > h2) {
                    console.log("not square");
                    intStep0 = null, intStep1 = null;
    
                    diag2Step0._children[0].visible = false;
                    diag2Step1._children[0].visible = false;
                    diag2Step0.addChild(interLine0);
                    diag2Step1.addChild(interLine1);
    
                    rank = precreaseStep1._children.length + diag21obj.rank;
                    steps = [[precreaseStep0, precreaseStep1], [diag2Step0, diag2Step1]];
                }
            } else {
                if (precreaseStep0) {steps.push([precreaseStep0, precreaseStep1])};
                if (diag2Step0)     {steps.push([diag2Step0, diag2Step1])};
                if (intStep0)       {steps.push([intStep0, intStep1])};
    
                rank = precreaseStep1._children.length + diag21obj.rank + 1;
            }
        } else {
            console.log("zero2");
            [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
            interPt = c1F.clone();
            preCreaseArr.push (...diag10obj.pointsPrelim);
            
            diag1Step0 = diag10obj.drawnGroup;
            diag1Step1 = diag11obj.drawnGroup;
    
            if (!tolerantSame (w1, h1) && findCreaseArr(preCreaseArr)) {
                preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
                linePusher(preCreaseLineArr, precreaseStep0, 0);
                linePusher(preCreaseLineArr, precreaseStep1, 1);
            } else precreaseStep0 = null;
    
            let interDot = dot(interPt, 0);
            let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
            interLine0.style = styleTime0;
            let interLine1 = interLine0.clone();
            interLine1.style = styleTime1;
            intStep0 = new paper.Group (interDot, interLine0);
            intStep1 = new paper.Group (interLine1)

            console.log(findRank(a1, b1).type);
    
            if (findRank(a1, b1).type === 'powTwo' && (a1 > b1 === w1 > h1 || tolerantSame (w1, h1))) {
                console.log("powtwo");
                if (tolerantSame (w1, h1)) {
                    console.log("square");
                    precreaseStep0 = null, precreaseStep1 = null;
                    intStep0 = null, intStep1 = null;
                    diag1Step0._children[0].visible = false;
                    diag1Step1._children[0].visible = false;
                    diag1Step0.addChild(interLine0);
                    diag1Step1.addChild(interLine1);
    
                    rank = diag11obj.rank;
                    steps = [[diag1Step0, diag1Step1]];
                } else if (a1 > b1 === w1 > h1) {
                    console.log("notsquare");
                    intStep0 = null, intStep1 = null;
    
                    diag1Step0._children[0].visible = false;
                    diag1Step1._children[0].visible = false;
                    diag1Step0.addChild(interLine0);
                    diag1Step1.addChild(interLine1);
    
                    rank = precreaseStep1._children.length + diag11obj.rank;
                    steps = [[precreaseStep0, precreaseStep1], [diag1Step0, diag1Step1]];
                }
            } else {
                if (precreaseStep0) {steps.push([precreaseStep0, precreaseStep1])};
                if (diag1Step0)     {steps.push([diag1Step0, diag1Step1])};
                if (intStep0)       {steps.push([intStep0, intStep1])};
    
                rank = precreaseStep1._children.length + diag11obj.rank + 1;
            }
        }
    } else {
        //handles 2/2
        console.log("twotwo");
        [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
        preCreaseArr.push (...diag10obj.pointsPrelim);
        diag1Step0 = diag10obj.drawnGroup;
        diag1Step1 = diag11obj.drawnGroup;
    
        [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
        preCreaseArr.push (...diag20obj.pointsPrelim);
        diag2Step0 = diag20obj.drawnGroup;
        diag2Step1 = diag21obj.drawnGroup;
    
        interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);
    
        uniq_fast(preCreaseArr);
        if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);
    
        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interPt.y), new paper.Point(1, interPt.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)
    
        if (precreaseStep0) {steps.push([precreaseStep0, precreaseStep1])};
        if (diag1Step0)     {steps.push([diag1Step0, diag1Step1])};
        if (diag2Step0)     {steps.push([diag2Step0, diag2Step1])};
        if (intStep0)       {steps.push([intStep0, intStep1])};
    
        rank = precreaseStep1._children.length + diag11obj.rank + diag21obj.rank + 1;
    }

    let result = {
        steps: steps,
        rank: rank
    }

    return result;
}

function negate (a, b, c) {return normalize(a * (a - c) - 2 * b ** 2, -b * c, (a - c) ** 2 - 2 * b ** 2)}

function eligibleA (a, b, c) {return ((a + b) / c >= 0 && b/c >= 0)};
function eligibleB (a, b, c) {return ((a + 2*b) / c >= 0 && -b / c >= 0)};
function eligibleC (a, b, c) {return (b / c >= 0 && (a - 2 * b) / c >= 0)};
function eligibleD (a, b, c) {return ((a - b) / c >= 0 && b / c >= 0)};
function eligibleE (a, b, c) {return ((a + b) / c >= 0 && (a + 2*b) / c >= 0)};
function eligibleF (a, b, c) {return ((a + b) / c >= 0 && (-a + 2*b) / c >= 0)};
function eligibleG (a, b, c) {return ((a + b) / c >= 0 && (-a + b) / c >= 0)};
function eligibleH (a, b, c) {return ((a + 2*b) / c >= 0 && (a - 2*b) / c >= 0)};
function eligibleI (a, b, c) {return ((a + 2*b) / c >= 0 && (a - b) / c >= 0)};
function eligibleJ (a, b, c) {return ((-a + 2*b) / c >= 0 && (a - b) / c >= 0)};