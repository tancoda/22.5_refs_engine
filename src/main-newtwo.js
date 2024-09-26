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
    cPScale = scale;

    // Calculate offsets to center the pattern
    const offsetX = (canvasWidth/4) - (width/2)*scale;
    const offsetY = (canvasHeight/2) - (height/2)*scale;
    cPOffsetX = offsetX;
    cPOffSetY = offsetY;

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

    if (globalC2.length > 0 && globalC2[window.variable-1][3].includes('default')) {
        draw(globalC2[window.variable-1][0],globalC2[window.variable-1][1],globalC2[window.variable-1][2],
            globalC2[window.variable-1][3],globalC2[window.variable-1][4],globalC2[window.variable-1][5],globalC2[window.variable-1][6])
    }
}

let cPScale, cPOffsetX, cPOffSetY;

function isPowerTwo(x) {
    return (Math.log(x) / Math.log(2)) % 1 === 0;
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

//a pair of numbers are scaled so that the larger equals one, but proportionality is maintained
function scaler(n, d) {
    const maxND = Math.max(n, d);
    n /= maxND;
    d /= maxND;
    return [n, d];
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

function revampAgain (a, b, w, h, type, meth, time, scaleX, scaleY, rotate, translate) {
    //corners of square
    var usbl = new paper.Point(0, 0);

    let scale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
    
    [w, h] = scaler(w, h);
    let [ascale, bscale] = scaler(a, b);
    [a, b] = simplify(a, b);

    //corners of block
    var bbl = usbl.clone();
    var bbr = new paper.Point(w, 0);
    var btr = new paper.Point(w, h);
    var btl = new paper.Point(0, h);

    let timeColor = time === 1 ? 'red' : 'black';
    var creaseStyle = {
        strokeColor: timeColor,
        strokeWidth: 1,
    } 

    var cstart = usbl;
    var cblock = new paper.Point(ascale * w, bscale * h);
    var csquare = new paper.Point(a * w, b * h);
    [csquare.x, csquare.y] = scaler(csquare.x, csquare.y);
    var crease = new paper.Path(cstart, csquare);
    crease.style = creaseStyle;

    function dot(point) {
        return new paper.Path.Circle({
            center: point,
            radius: dotsize,
            fillColor: 'black',
            visible: (time === 1)
        });
    }

    const fontSize = 12 / scale;

    function highLighter (from,to) {
        var fromDot = dot(from);
        var toDot = dot(to);
        var line = new paper.Path.Line({
            from: from,
            to: to,
            strokeColor: 'black',
            strokeWidth: 1,
            shadowBlur: 4,
            shadowColor: 'yellow',
            visible: (time === 1)
        })
        let highLightLine = new paper.Group(fromDot, toDot, line);
        return highLightLine;
    }

    const border = new paper.Path.Rectangle({
            from: new paper.Point(0,0),
            to: new paper.Point(1,1),
            strokeColor: 'black',
            strokeWidth: 1,
    });

    //powTwo
    
    let tall = false, wide = false, square = false;
    if (w > h) {wide = true;}
    if (w === h) {square = true;}
    if (w < h) {tall = true;}   

    let powTwoHighLight, powTwoDot, powTwoDotPt, powTwoLabelText, powTwoBlockDot, powTwoTextPt;
    let powTwoTextJust = 'center';

    if (isPowerTwo(Math.max(a,b))) {
        if (square) {
            powTwoDotPt = csquare;
            powTwoDot = dot(csquare);
            powTwoLabelText = `${Math.min(a,b)}/${Math.max(a,b)}`;
            powTwoTextPt = csquare.clone();
            if (a < b) {
                powTwoHighLight = highLighter(btl, btr);
                powTwoTextPt.y += fontSize;
            } else if (a > b) {
                powTwoHighLight = highLighter(btr, bbr);
                powTwoTextJust = 'left'
            } else {
                powTwoTextPt.y += fontSize;
            }
        } else {
            powTwoBlockDot = dot(btr);
            if (a < b) {
                powTwoHighLight = highLighter(btl,btr);
                powTwoDotPt = new paper.Point(w*a/b, h);
                powTwoLabelText = `${a}/${b}`;
                powTwoTextPt = powTwoDotPt.clone();
                powTwoTextPt.y += fontSize;
            } else if (b < a) {
                powTwoHighLight = highLighter(btr,bbr);
                powTwoDotPt = new paper.Point(w,h*b/a);
                powTwoLabelText = `${b}/${a}`;
                powTwoTextPt = powTwoDotPt.clone();
                powTwoTextJust = 'left';
            }
            powTwoDot = dot(powTwoDotPt);
        }
        if (a === b) {powTwoLabelText = ''};
    }

    var powTwoLabel = new paper.PointText({
        point: powTwoTextPt,
        content: powTwoLabelText,
        fontSize: fontSize,
        fillColor: 'black',
        justification: powTwoTextJust
    })

    let creasePowTwo = crease.clone();

    var validPowTwoItems = [creasePowTwo, powTwoHighLight, powTwoLabel, powTwoDot, powTwoBlockDot]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var powTwoGroup = new paper.Group(validPowTwoItems);
    powTwoGroup.visible = false;
    
    //general
    
    const smallestPowTwo = 2 ** Math.ceil(Math.log2(Math.max(a, b)));

    const vertX = w*a/smallestPowTwo;
    const horiY = h*b/smallestPowTwo;

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

    let horiNear = false;
    let horiFar = false;
    let vertNear = false;
    let vertFar = false;

    if (isOne(w, h)) {
        if (a <= smallestPowTwo/2) {
            horiNear = true;
        } else if (wide || square) {
            horiFar = true;
        }
        if (b <= smallestPowTwo/2) {
            vertNear = true;
        } else if (tall || square) {
            vertFar = true;
        }
    } else if (isRtTwoMinusOne(w, h)) {
        horiNear = true;
        if (meth === 'A') {
            vertNear = true;
        } else {
            vertFar = true;
        }
    } else if (isTwoMinusRtTwo(w, h)) {
        horiNear = true;
        if (meth === 'H') {
            vertNear = true;
        } else {
            vertFar = true;
        } 
    } else if (isOnePlusHalfRtTwo(w, h)) {
        vertNear = true;
        if (meth === 'F') {
            horiNear = true;
        } else {
            horiFar = true;
        } 
    } else if (isRtTwoPlusOne(w, h)) {
        vertNear = true;
        if (meth === 'G') {
            horiNear = true;
        } else {
            horiFar = true;
        } 
    } 

    if (horiFar) {
        horiX = 1;
        horiJust = 'left';
        vertHighLightStart.x = 1;
        vertHighLightFinish.x = 1;
    } else {
        horiX = 0;
    }

    if (vertFar) {
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
    let vertDot = dot(vertStart);
    let horiDot = dot(horiStart);
    let vertHighLight = highLighter(vertHighLightStart, vertHighLightFinish);
    let horiHighLight = highLighter(horiHighLightStart, horiHighLightFinish);

    let horiText = new paper.PointText({
        point: new paper.Point(horiX, horiY),
        content: horiTextLabel,
        fillColor: 'black',
        fontSize: fontSize,
        justification: horiJust
    })

    let vertText = new paper.PointText({
        point: new paper.Point(vertX, vertTexY),
        content: vertTextLabel,
        fillColor: 'black',
        fontSize: fontSize,
        justification: vertJust
    })

    let creaseGen = crease.clone();

    var validGenItems = [creaseGen, vertHighLight, horiHighLight, vertDot, horiDot, vertLine, horiLine, genIntPt, vertText, horiText]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var genGroup = new paper.Group(validGenItems);
    genGroup.visible = false;

    //diags
    
    var diagStart = btl.clone();
    var diagFinish = bbr.clone();
    let diagNumA = a, diagNumB = b, diagDenom = Math.max(a,b);
    let diagLabelPt = bbl.clone();
    let diagLabelText = '';

    let diagLabelSide;
    let parallelLabelSide;

    //returns relevant diagStart/Finish, diagDenom, diagLabelPt, diagLabelText
    if (type.includes('diag')) {
        let typeFixed = type;
        if (a>b) {
            switch(type) {
                case 'diagA':
                    break;
                case 'diagB':
                    typeFixed = 'diagC';
                    break;
                case 'diagC':
                    typeFixed = 'diagB';
                    break;
                case 'diagD':
                    typeFixed = 'diagE';
                    break;
                case 'diagE':
                    typeFixed = 'diagD';
                    break;
                case 'diagF':
                    typeFixed = 'diagG';
                    break;
                case 'diagG':
                    typeFixed = 'diagF';
                    break;
                default:
                    break;
            }
        }
        switch(typeFixed) {
            case 'diagA':
                if (isPowerTwo(a + b)) {
                    diagDenom = a+b;
                } else throw new Error('diagA issue');
                break;
            case 'diagB':
                if (isPowerTwo(a + 2*b)) {
                    diagStart.y = h/2;
                    diagDenom = a + 2*b;
                    diagLabelPt.y = h/2;
                    diagLabelText = '1/2';
                    diagLabelSide = 'left';
                } else throw new Error('diagB issue');            
                break;
            case 'diagC':
                if (isPowerTwo(2*a + b)) {
                    diagFinish.x = w/2;
                    diagDenom = 2*a + b;
                    diagLabelPt.x = w/2;
                    diagLabelText = '1/2';
                    diagLabelSide = 'bottom';
                } else throw new Error('diagC issue');
                break;
            case 'diagD':
                if (isPowerTwo(a + 4*b)) {
                    diagStart.y = h/4;
                    diagDenom = a + 4*b;
                    diagLabelPt.y = h/4;
                    diagLabelText = '1/4';
                    diagLabelSide = 'left';
                } else throw new Error('diagD issue');
                break;
            case 'diagE':
                if (isPowerTwo(4*a + b)) {
                    diagFinish.x = w/4;
                    diagDenom = 4*a + b;
                    diagLabelPt.x = w/4;
                    diagLabelText = '1/4';
                    diagLabelSide = 'bottom';
                } else throw new Error('diagE issue');
                break;
            case 'diagF':
                if (isPowerTwo(3*a + 4*b)) {
                    diagStart.y = 3*h/4;
                    diagDenom = 3*a + 4*b;
                    diagLabelPt.y = 3*h/4;
                    diagLabelText = '3/4';
                    diagLabelSide = 'left';
                } else throw new Error('diagF issue');
                break;
            case 'diagG':
                if (isPowerTwo(4*a + 3*b)) {
                    diagFinish.x = 3*w/4;
                    diagDenom = 4*a + 3*b;
                    diagLabelPt.x = 3*w/4;
                    diagLabelText = '3/4';
                    diagLabelSide = 'bottom';
                } else throw new Error('diagG issue');
                break;
            default:
                break;
        }
    }
    
    

    let diagInt = intersect(diagStart.x, diagStart.y, diagFinish.x, diagFinish.y, cstart.x, cstart.y, cblock.x, cblock.y);
    let diagIntDot = dot(diagInt);
    var parallelStart = bbl.clone();
    let parallelText  = '';
    var highLightX = highLighter(bbl,bbr);
    var highLightY = highLighter(bbl,btl);
    let diagDot = dot(diagLabelPt);
    
    [diagNumA, diagDenom] = simplify(diagNumA, diagDenom);
    [diagNumB, diagDenom] = simplify(diagNumB, diagDenom);

    let parallelLabelPt;
    let parallelLabelJust = 'center';

    if (diagFinish.x > diagStart.y){
        parallelStart.x = diagInt.x;
        parallelText = `${diagNumA}/${diagDenom}`;
        parallelLabelPt = parallelStart.clone();
        parallelLabelPt.y -= fontSize;
    } else if (diagFinish.x < diagStart.y){
        parallelStart.y = diagInt.y;
        parallelText = `${diagNumB}/${diagDenom}`;
        parallelLabelPt = parallelStart.clone();
        parallelLabelJust = 'right';
    } else if (diagFinish.x === diagStart.y) {
        diagDot.visible = false;
        if (a*w >= b*h) {
            parallelStart.x = diagInt.x;
            parallelText = `${diagNumA}/${diagDenom}`;
            highLightY.visible = false;
            parallelLabelPt = parallelStart.clone();
            parallelLabelPt.y -= fontSize;
        } else {
            parallelStart.y = diagInt.y;
            parallelText = `${diagNumB}/${diagDenom}`;
            highLightX.visible = false;
            parallelLabelPt = parallelStart.clone();
            parallelLabelJust = 'right';
        }
    }
    
    let parallelDot = dot(parallelStart)
    var parallelLine = new paper.Path(parallelStart, diagInt);
    parallelLine.style = creaseStyle;

    let diagJust;
    if (diagLabelSide === 'left') {diagJust = 'right'} else {diagJust = 'center'};
    if (diagLabelSide === 'bottom') {diagLabelPt.y -= fontSize};

    var diagText = new paper.PointText({
        point: diagLabelPt,
        content: diagLabelText,
        fillColor: 'black',
        fontSize: fontSize,
        justification: diagJust
    })

    var parallelTextObj = new paper.PointText({
        point: parallelLabelPt,
        content: parallelText,
        fillColor: 'black',
        fontSize: fontSize,
        justification: parallelLabelJust
    })

    let diagLine = new paper.Path(diagStart, diagFinish);
    diagLine.style = creaseStyle;
    
    let anotherDot;
    if (w > h) {
        anotherDot = dot(new paper.Point(0, h));
    } else if (h > w) {
        anotherDot = dot(new paper.Point(w, 0));
    }
    
    let creaseDiag = crease.clone();

    var validDiagItems = [creaseDiag, anotherDot, highLightX, highLightY, parallelLine, diagIntDot, diagLine, diagDot, parallelDot, parallelTextObj, diagText]
    .filter(item => item instanceof paper.Item); // Only keep valid Paper.js items

    var diagGroup = new paper.Group(validDiagItems);
    diagGroup.visible = false;
    
    //processing, display:
    function orient(group) {
        group.pivot = new paper.Point(0.5,0.5)
        group.scale(scaleX, scaleY);
        group.rotate(rotate);
        group.position = new paper.Point(translate[0], translate[1]);
    }

    function scaleTextIfNegative(textObj) {
        if (scaleX < 0) {textObj.scale(-1, 1)};
        if (scaleY < 0) {textObj.scale(1, -1)};
        textObj.rotation = 0;
        textObj.visible = (time === 1);
    }

    if (type === 'powTwo' && time >= 1) {
        powTwoGroup.visible = true;
        orient(powTwoGroup);
        scaleTextIfNegative(powTwoLabel);
        return powTwoGroup;
    } else if (type.includes('diag') && time >= 1) {
        diagGroup.visible = true;
        orient(diagGroup);
        scaleTextIfNegative(parallelTextObj);
        scaleTextIfNegative(diagText);
        return diagGroup;
    } else if (time >= 1) {
        genGroup.visible = true;
        orient(genGroup);
        scaleTextIfNegative(vertText);
        scaleTextIfNegative(horiText);
        return genGroup;
    }
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
    return [slopePair, blockInfo];
};

function problem (a, b) {return ((findRank(a, b)).type === 'powTwo')};

function isOne(w, h)                {return (Math.abs(w/h - 1) < 10 ** -6)};
function isRtTwoPlusOne(w, h)       {return (Math.abs(w/h - (Math.SQRT2 + 1)) < 10 ** -6)};
function isRtTwoMinusOne(w, h)      {return (Math.abs(w/h - (Math.SQRT2 - 1)) < 10 ** -6)};
function isOnePlusHalfRtTwo(w,h)    {return (Math.abs(w/h - (1 + Math.SQRT2/2)) < 10 ** -6)};
function isTwoMinusRtTwo(w,h)       {return (Math.abs(w/h - (2 - Math.SQRT2)) < 10 ** -6)};

// Function to draw rectangles based on the number of steps
function draw(a, b, c, name, meth, val, elev) {

    let sloped = sloper(elev[0], elev[1], elev[2], meth);

    let a1 = sloped[0][0], b1 = sloped[0][1], a2 = sloped[0][2], b2 = sloped[0][3];

    let w1 = sloped[1][0], w2 = sloped[1][1];
    let h1 = 1, h2 = 1;

    let zero1 = (a1 === 0 || b1 === 0 || a1 === -0 || b1 === -0);
    let one1 = (a1/b1 === 1);
    let zero2 = (a2 === 0 || b2 === 0 || a2 === -0 || b2 === -0);
    let one2 = (a2/b2 === 1);

    let typeA = (findRank(a1, b1)).type;
    let typeB = (findRank(a2, b2)).type;

    let numSteps;
    if      (zero1 && w2/h2 === 1 && typeB === 'powTwo') {numSteps = 1}
    else if (zero2 && w1/h1 === 1 && typeA === 'powTwo') {numSteps = 1}
    else if ((zero1 && one2) || (one1 && zero2)) {numSteps = 2}
    else if (one2 && one1) {numSteps = 2}
    else if ((zero1 && !one2) || (zero2 && !one1)) {numSteps = 3}
    else if ((one1 && !one2) || (one2 && !one1)) {numSteps = 3}
    else if (!zero1 && !one1 && !zero2 && !one2) {numSteps = 4}

    // Get the canvas size
    const canvas = document.getElementById('myCanvas');
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Adjust the step size based on the canvas dimensions
    const stepSize = Math.min(canvasHeight / 2, canvasWidth / 6) * 0.8;

    const y1 = canvasHeight / 2 - canvasWidth / 12 - stepSize / 2;
    const y2 = canvasHeight / 2 - stepSize / 2;
    const y3 = canvasHeight / 2 + canvasWidth / 12 - stepSize / 2;

    const x1 = 7 * canvasWidth / 12 - stepSize / 2;
    const x2 = 2 * canvasWidth / 3 - stepSize / 2;
    const x3 = 3 * canvasWidth / 4 - stepSize / 2;
    const x4 = 5 * canvasWidth / 6 - stepSize / 2;
    const x5 = 11 * canvasWidth / 12 - stepSize / 2;

    const stepData = [
        //[[x3, y2]], 
        //[[x2, y2], [x4, y2]], 
        //[[x1, y2], [x3, y2], [x5, y2]],
        //[[x2, y1], [x4, y1], [x2, y3], [x4, y3]],
        //[[x1, y1], [x3, y1], [x5, y1], [x2, y3], [x4, y3]],
        [x1, y1], [x3, y1], [x5, y1], [x1, y3], [x3, y3], [x5, y3]
    ];

    let rotate = 0;

    let aFinal = a, bFinal = b, cFinal = c;
    let aInt = elev[0], bInt = elev[1], cInt = elev[2];

    [aFinal, bFinal, cFinal] = normalize(aFinal, bFinal, cFinal);
    [aInt, bInt, cInt] = normalize(aInt, bInt, cInt);

    const elevationFinal = inverse(aFinal, bFinal, cFinal);
    const elevationFinalCoord = summup(elevationFinal[0], elevationFinal[1], elevationFinal[2])
    const elevInt = inverse(aInt, bInt, cInt);
    const elevIntCoord = summup(elevInt[0], elevInt[1], elevInt[2]);

    var dSLs = new paper.Point(0,0);
    var dSLf = new paper.Point(1,1);

    let targetElev = elevationFinalCoord;

    searchVi(globalVi, elevationFinalCoord, 10 ** -8, cPScale, cPOffsetX, cPOffSetY);

    if (xory === 'X') {
        dSLs.x = (stepData[numSteps-1][0]);
        dSLs.y = (stepData[numSteps-1][1]) + targetElev*stepSize;
        dSLf.x = (stepData[numSteps-1][0] + stepSize);
        dSLf.y = (stepData[numSteps-1][1]) + targetElev*stepSize;
    } else {
        dSLs.x = (stepData[numSteps-1][0] + targetElev*stepSize);
        dSLs.y = (stepData[numSteps-1][1] );
        dSLf.x = (stepData[numSteps-1][0] + targetElev*stepSize);
        dSLf.y = (stepData[numSteps-1][1] + stepSize);
    }

    var desiredLine = new paper.Path.Line ({
        from: dSLs,
        to: dSLf,
        strokeColor: 'red',
        strokeWidth: 1
    });

    if (xory === 'Y') {rotate -= 90};
    if (name.includes('neg')) {rotate += 180};

    const screen = new paper.Group();

    //console.log("numSteps: " + numSteps);

    function borderFactory(numSteps) {
        const border = new paper.Path.Rectangle({
            from: new paper.Point(stepData[numSteps][0], stepData[numSteps][1]),
            to: new paper.Point(stepData[numSteps][0] + stepSize, stepData[numSteps][1] + stepSize),
            strokeColor: 'black',
            strokeWidth: 1,
        });
        return border;
    }

    //console.log("stepsize: " + stepSize);

    let numAfterSteps = numSteps;

    if (name.includes("double") || name.includes("quadruple")) {
        numAfterSteps += 1;
    } else if (!(name.includes("default"))) {
        numAfterSteps += 2;
    };

    dotsize = 2/stepSize;

    if (numSteps === 1) {
        let stepone;
        if (zero2) {
            stepone =       revampAgain(a1, b1, w1, h1, typeA, meth, 1, stepSize,  stepSize, rotate,   [stepData[0][0] + stepSize/2, stepData[0][1] + stepSize/2])
        } else stepone = revampAgain(a2, b2, w2, h2, typeB, meth, 1, stepSize,  stepSize, rotate,   [stepData[0][0] + stepSize/2, stepData[0][1] + stepSize/2])
        let border = borderFactory(0);
        stepone._children[0].visible = false;
        screen.addChild(stepone);
        screen.addChild(border);
    } else if (numSteps === 2) {
        for (let i = 0; i < numAfterSteps; i++) {
            const translate = stepData[i];
            let border = borderFactory(i);
            let stepone = stepOneRedo(w1, h1, w2, h2, [stepSize, stepSize], rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2], i+1, a1, b1, a2, b2);
            screen.addChild(border);
            screen.addChild(stepone);
        }
    } else if (numSteps === 3) {
        let c1sx, c1sy, c1fx, c1fy;
        for (let i = 0; i < numAfterSteps; i++) {
            const translate = stepData[i];
            let border = borderFactory(i);
            let stepone = stepOneRedo(w1, h1, w2, h2, [stepSize, stepSize], rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2], i+1, a1, b1, a2, b2);
            let stepTwo;
            if (one2 || zero2) {
                stepTwo = revampAgain(a1, b1, w1, h1, typeA, meth, i, stepSize,  stepSize, rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2]);
            } else {
                stepTwo = revampAgain(a2, b2, w2, h2, typeB, meth, i, -stepSize,  stepSize, rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2]);
            }
            screen.addChild(border);
            screen.addChild(stepone);
            screen.addChild(stepTwo);
            if (stepTwo && stepTwo._children) {
                let path = stepTwo._children[0];
                let startPoint =    path.segments[0].point;  // Start point
                let endPoint =      path.segments[path.segments.length - 1].point;  // End point
                c1sx = startPoint.x;
                c1sy = startPoint.y;
                c1fx = endPoint.x;
                c1fy = endPoint.y;
            }
        }
        let ref3 = intersect(c1sx, c1sy, c1fx, c1fy, dSLs.x, dSLs.y, dSLf.x, dSLf.y);
        if (ref3) {
            let dotRef3 = new paper.Path.Circle({
                center: ref3,
                radius: 2,
                fillColor: 'black',
            });
        } else {
            let dotARef3 = new paper.Path.Circle({
                center: dSLs,
                radius: 2,
                fillColor: 'black',
            });
            let dotBRef3 = new paper.Path.Circle({
                center: dSLf,
                radius: 2,
                fillColor: 'black',
            });
        }
    } else if (numSteps === 4) {
        let c1sx, c1sy, c1fx, c1fy, c2sx, c2sy, c2fx, c2fy;
        for (let i = 0; i < numAfterSteps; i++) {
            const translate = stepData[i];
            let border = borderFactory(i);
            let stepone = stepOneRedo(w1, h1, w2, h2, [stepSize, stepSize], rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2], i+1, a1, b1, a2, b2);
            let stepTwo = revampAgain(a1, b1, w1, h1, typeA, meth, i, stepSize,  stepSize, rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2]);
            let stepThr = revampAgain(a2, b2, w2, h2, typeB, meth, i-1, -stepSize,  stepSize, rotate, [stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2]);
            if (stepTwo && stepTwo._children) {
                let path = stepTwo._children[0];
                let startPoint =    path.segments[0].point;  // Start point
                let endPoint =      path.segments[path.segments.length - 1].point;  // End point
                c1sx = startPoint.x;
                c1sy = startPoint.y;
                c1fx = endPoint.x;
                c1fy = endPoint.y;
            }
            if (stepThr && stepThr._children) {
                let path = stepThr._children[0];
                let startPoint = path.segments[0].point;
                let endPoint =   path.segments[path.segments.length - 1].point;
                c2sx = startPoint.x;
                c2sy = startPoint.y;
                c2fx = endPoint.x;
                c2fy = endPoint.y;
            }
            screen.addChild(border);
            screen.addChild(stepone);
            screen.addChild(stepTwo);
            screen.addChild(stepThr);
            //encode the dot as an intersection!  bring the points home from creases
        }
        let ref4 = intersect(c1sx, c1sy, c1fx, c1fy, c2sx, c2sy, c2fx, c2fy);
        if (ref4) {
            let dotRef4 = new paper.Path.Circle({
                center: ref4,
                radius: 2,
                fillColor: 'black',
            });
        }        
    }
}

let dotsize;

function stepOneRedo(w1, h1, w2, h2, scale, rotate, translate, time, a1, b1, a2, b2) {
    
    var ptOne = new paper.Point(0, 0);
    var border = new paper.Path.Rectangle(ptOne, new paper.Point(1,1));

    var bl = new paper.Point(0,0);
    var tl = new paper.Point(0,1);
    var tr = new paper.Point(1,1);
    var br = new paper.Point(1,0);
    var bo = new paper.Point(Math.SQRT2-1,0);
    var bt = new paper.Point(2-Math.SQRT2,0);
    var lo = new paper.Point(0,Math.SQRT2-1);
    var lt = new paper.Point(0,2-Math.SQRT2);
    var ro = new paper.Point(1,Math.SQRT2-1);
    var rt = new paper.Point(1,2-Math.SQRT2);
    var to = new paper.Point(Math.SQRT2-1,1);
    var tt = new paper.Point(2-Math.SQRT2,1);

    const tolerance = 10 ** -6;

    let zero1 = (a1 === 0 || b1 === 0 || a1 === -0 || b1 === -0);
    let one1 = (a1/b1 === 1);
    let zero2 = (a2 === 0 || b2 === 0 || a2 === -0 || b2 === -0);
    let one2 = (a2/b2 === 1);

    var prelimGroup = new paper.Group(border);

    function linePusher(arr) {
        for (let i=0; i<arr.length; i++) {
            var lineToBePushed = new paper.Path.Line(arr[i][0],arr[i][1]);
            prelimGroup.addChild(lineToBePushed);
        }
    }

    let scaleOneNumb = Math.max(Math.abs(scale[0]), Math.abs(scale[1]))

    function dotStepOne(pt1, pt2, pt3, pt4) {
        let intersection = (intersect(pt1.x, pt1.y, pt2.x, pt2.y, pt3.x, pt3.y, pt4.x, pt4.y))
        let dot = new paper.Path.Circle({
            center: intersection,
            radius: 2/3 * dotsize,
            fillColor: 'black',
            visible: time === 2
        });
        prelimGroup.addChild(dot);
    }

    let pointBucket = [];
    if (one1 && one2) {
        if (isOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([bl,tr],[tl,br],[br,tt]);
                dotStepOne(bl, tr, tt, br);
                console.log("A, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([bl,tr], [bl,to], [br,to]);
                dotStepOne(bl, tr, to, br);
                console.log("B, one & one");
            }
        } else if (isOne(w2, h2)) {
            if (isOnePlusHalfRtTwo(w1, h1)) {
                pointBucket.push([tl,br], [tl,rt], [bl,rt]);
                dotStepOne(bl, rt, tl, br);
                console.log("C, one & one");
            } else if (isRtTwoPlusOne(w1, h1)) {
                pointBucket.push([tl,br], [bl,ro], [bl,tr]);
                dotStepOne(bl, ro, tl, br);
                console.log("D, one & one");
            }
        } else if (isRtTwoPlusOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([bl,tr],[bl,ro],[tt,br]);
                dotStepOne(bl, ro, tt, br);
                console.log("G, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([bl,tr], [bl,to],[bl,ro],[to,br]);
                dotStepOne(bl, ro, to, br);
                console.log("I, one & one");
            } else if (isOnePlusHalfRtTwo(w2, h2)) {
                pointBucket.push([tl,br], [tl,rt], [br,lo], [bl,rt]);
                dotStepOne(br, lo, bl, rt);
                console.log("J, one & one");
            }
        } else if (isOnePlusHalfRtTwo(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([tl,br],[tl,rt],[br,tt],[bl,rt]);
                dotStepOne(bl, rt, br, tt);
                console.log("F, one & one");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([tl,br], [tl,rt], [bl,rt],[to,br]);
                dotStepOne(bl, rt, to, br);
                console.log("H, one & one");
            }
        }
    } else if (zero1 || zero2) {
        if (one1 || one2) {
            if ((one1 && isRtTwoPlusOne(w1, h1)) || (one2 && isRtTwoPlusOne(w2, h2))) {
                pointBucket.push([bl,tr],[bl,ro]);
                console.log("zero & one(rt2+1)");
            }
            else if ((one1 && isOnePlusHalfRtTwo(w1, h1)) || (one2 && isOnePlusHalfRtTwo(w2, h2))) {
                pointBucket.push([bl,tr],[tr,lt]);
                console.log("zero & one(1+rt2/2)")
            }
        } else {
            if ((zero2 && isRtTwoPlusOne(w1, h1)) || (zero1 && isRtTwoPlusOne(w2, h2))) {
                pointBucket.push([tl,br], [lo,br], [lo,ro]);
                console.log("standalone A");
            } else if ((zero2 && isOnePlusHalfRtTwo(w1, h1)) || (zero1 && isOnePlusHalfRtTwo(w2, h2))) {
                pointBucket.push([tl,br], [tl,rt], [lt,rt]);
                console.log("standalone B");
            } else if ((zero2 && isTwoMinusRtTwo(w1, h1)) || (zero1 && isTwoMinusRtTwo(w2, h2))) {
                pointBucket.push([bl,tr], [bl,to], [to,bo]);
                console.log("standalone C");
            } else if ((zero2 && isRtTwoMinusOne(w1, h1)) || (zero1 && isRtTwoMinusOne(w2, h2))) {
                pointBucket.push([bl,tr], [tr,bt], [tt,bt]);
                console.log("standaloneD");
            }
        }
    } else {
        if (isOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                pointBucket.push([tl, br], [br,tt]);
                if (one1) {pointBucket.push([bl, tr])};
                if (problem(a2, b2, w2, h2)) {pointBucket.push([tt, bt])};
                console.log("A");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                pointBucket.push([bl, tr], [bl, to]);
                if (one2) {pointBucket.push([to, br])};
                if (problem(a2, b2, w2, h2)) {pointBucket.push([to, bo])};
                console.log("B");
            }
        } else if (isOne(w2, h2)) {
            if (isOnePlusHalfRtTwo(w1, h1)) {
                pointBucket.push([tl, br], [tl, rt]);
                if (one1) {pointBucket.push([bl, rt])};
                if (problem(a1, b1, w1, h1)) {pointBucket.push([rt, lt])};
                console.log("C");
            } else if (isRtTwoPlusOne(w1, h1)) {
                if (one1) {pointBucket.push([bl,ro],[bl,tr],[lo,ro])}
                else {pointBucket.push([tl,br],[lo,br],[lo,ro])}
                console.log("D");
            }
        } else if (isTwoMinusRtTwo(w1, h1) && (isRtTwoMinusOne(w2, h2))) {
            pointBucket.push([tl, br], [br, tt]);
            if (one1) {pointBucket.push([bl,tt])};
            if (problem(a1, b1, w1, h1) || problem(a2, b2, w2, h2)) {pointBucket.push([tt, bt])};
            console.log("E");
        } else if (isRtTwoPlusOne(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                if (!(problem(a1, b1, w1, h1) || problem(a2, b2, w2, h2))) {
                    pointBucket.push([tl, br], [br, tt], [br, lo]);
                    if (one1) {pointBucket.push([lo, ro], [bl, ro])};
                } else {
                    pointBucket.push([tl,br], [br,tt], [tt,bt], [lo,ro]);
                    if (one1) {pointBucket.push([bl, ro])};
                }
                console.log("G");                
            } else if (isTwoMinusRtTwo(w2, h2)) {
                if (!(problem(a1, b1, w1, h1) || problem(a2, b2, w2, h2))) {
                    pointBucket.push([bl, tr], [bl, to], [bl, ro]);
                } else {
                    pointBucket.push([bl,tr], [bo,to], [lo,ro], [bl,ro]);
                }
                if (one2) {pointBucket.push([to, br])};
                console.log("I");
            } else if (isOnePlusHalfRtTwo(w2, h2)) {
                pointBucket.push([bl, tr], [bl, ro], [tr, lt]);
                if (problem(a1, b1, w1, h1)) {pointBucket.push([lo, ro])};
                if (problem(a2, b2, w2, h2)) {pointBucket.push([lt, rt])};
                if (one2) {pointBucket.push([lt, br])};
                console.log("J");
            }
        } else if (isOnePlusHalfRtTwo(w1, h1)) {
            if (isRtTwoMinusOne(w2, h2)) {
                if (!(problem(a1, b1, w1, h1) || problem(a2, b2, w2, h2))) {
                    pointBucket.push([tl, br], [tl,rt], [tt, br]);
                } else pointBucket.push([bl, tr], [tr, bt], [tt, bt], [lt, rt]);
                if (one1) {pointBucket.push([bl, rt])};
                if (one2) {pointBucket.push([tt, br])};
                console.log("F");
            } else if (isTwoMinusRtTwo(w2, h2)) {
                if (!(problem(a1, b1, w1, h1) || problem(a2, b2, w2, h2))) {
                    pointBucket.push([tl, br], [tl, bo], [tl, rt]);
                } else pointBucket.push([tl, br], [tl, bo], [to, bo], [lt, rt]);
                if (one1) {pointBucket.push([bl, rt])};
                if (one2) {pointBucket.push([to, br])};
                console.log("H");
            }
        }
    }
    
    linePusher(pointBucket);

    prelimGroup.pivot = new paper.Point(0.5,0.5)
    prelimGroup.scale(scale[0], scale[1]);
    prelimGroup.rotate(rotate);
    prelimGroup.position = new paper.Point(translate[0], translate[1]);
    prelimGroup.strokeWidth = 1;
    if (time == 1) {prelimGroup.strokeColor = 'red'} else {prelimGroup.strokeColor = 'black'};
    border.strokeColor = 'black'
    prelimGroup.visible = true;
    console.log("scaleonenumb: " + scaleOneNumb);
    console.log(scale);
}

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
function diagA(a,b) {if (isPowerTwo(a+b)) {return Math.log(a+b)/Math.log(2) + 2} else {return Infinity}};

function diagB(a,b) {if (isPowerTwo(a + 2*b)) {return Math.log(a + 2*b)/Math.log(2) + 3} else {return Infinity}};

function diagC(a,b) {if (isPowerTwo(2*a + b)) {return Math.log(2*a + b)/Math.log(2) + 3} else {return Infinity}};

function diagD (a,b) {if (isPowerTwo(a + 4*b)) {return Math.log(a + 4*b)/Math.log(2) + 4} else {return Infinity}};

function diagE (a,b) {if (isPowerTwo(4*a + b)) {return Math.log(4*a + b)/Math.log(2) + 4} else {return Infinity}};

function diagF (a,b) {if (isPowerTwo(3*a + 4*b)) {return Math.log(3*a + 4*b)/Math.log(2) + 4} else {return Infinity}};

function diagG (a,b) {if (isPowerTwo(4*a + 3*b)) {return Math.log(4*a + 3*b)/Math.log(2) + 4} else {return Infinity}};

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

    let result = lookupTable.find(row => row.numerator === numerator && row.denominator === denominator);
    if (numerator === 0 || denominator === 0) {result.rank = 0};
    if (numerator/denominator === 1) {result.rank = 1};
    if (denominator/numerator > m || numerator/denominator > m) {result.rank = Infinity};

    return result ? result: null;
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
        //...doubleType,
        //...quadrupleType,
        //...bisectorType,
        //...switchItType,
        //...hsaType,
        //...hsbType
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