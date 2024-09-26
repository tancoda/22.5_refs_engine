function isPowerTwo(x) {
    return (Math.log(x) / Math.log(2)) % 1 === 0;
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

function revampAgain (a, b, w, h, type, time, scaleX, scaleY, rotate, translate) {
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
            radius: 2/scale,
            fillColor: 'black',
            visible: (time === 1)
        });
    }

    const fontSize = 12 / scale;

    function highLighter (from,to) {
        return new paper.Path.Line({
            from: from,
            to: to,
            strokeColor: 'black',
            strokeWidth: 1,
            shadowBlur: 4,
            shadowColor: 'yellow',
            visible: (time === 1)
        })
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

    var validPowTwoItems = [powTwoHighLight, powTwoLabel, powTwoDot, powTwoBlockDot]
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
    
    horiJust = 'right';
    vertJust = 'center';
    
    let horiHighLightStart = new paper.Point(0,0);
    let vertHighLightStart = new paper.Point(0,0);
    let horiHighLightFinish = new paper.Point(w,0);
    let vertHighLightFinish = new paper.Point(0,h);

    if (a <= smallestPowTwo/2) {
        horiX = 0;
    } else if (wide || square) {
        console.log('woop');
        horiX = 1;
        horiJust = 'left';
        vertHighLightStart.x = 1;
        vertHighLightFinish.x = 1;
    }

    if (b <= smallestPowTwo/2) {
        vertY = 0;
        vertTexY -= fontSize;
    } else if (tall || square) {
        vertY = 1;
        vertTexY = 1;
        vertTexY += fontSize;
        horiHighLightStart.y = 1;
        horiHighLightFinish.y = 1;
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

    var validGenItems = [vertHighLight, horiHighLight, vertDot, horiDot, vertLine, horiLine, genIntPt, vertText, horiText]
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
    switch(type) {
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
    
    var validDiagItems = [anotherDot, highLightX, highLightY, parallelLine, diagIntDot, diagLine, diagDot, parallelDot, parallelTextObj, diagText]
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
    } else if (type.includes('diag') && time >= 1) {
        diagGroup.visible = true;
        orient(diagGroup);
        scaleTextIfNegative(parallelTextObj);
        scaleTextIfNegative(diagText);
    } else if (time >= 1) {
        genGroup.visible = true;
        orient(genGroup);
        scaleTextIfNegative(vertText);
        scaleTextIfNegative(horiText);
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
    [[x3, y2]], 
    [[x2, y2], [x4, y2]], 
    [[x1, y2], [x3, y2], [x5, y2]],
    [[x2, y1], [x4, y1], [x2, y3], [x4, y3]],
    [[x1, y1], [x3, y1], [x5, y1], [x2, y3], [x4, y3]],
    [[x1, y1], [x3, y1], [x5, y1], [x1, y3], [x3, y3], [x5, y3]],
];

// Function to draw rectangles based on the number of steps
function draw(a, b, c, name, meth, val, elev) {

    let sloped = sloper(elev[0], elev[1], elev[2], meth);

    let a1 = sloped[0][0], b1 = sloped[0][1], a2 = sloped[0][2], b2 = sloped[0][3];

    let w1 = sloped[1][0], w2 = sloped[1][1];
    let h1 = 1, h2 = 1;

    zero1 = (a1 === 0 || b1 === 0)
    one1 = (a1/b1 === 1)
    zero2 = (a2 === 0 || b2 === 0)
    one2 = (a2/b2 === 1)

    let numSteps;
    if ((zero1 && one2) || (one1 && zero2)) {numSteps = 2};
    if (one2 && one1) {numSteps = 2};
    if ((zero1 && !one2) || (zero2 && !one1)) {numSteps = 3};
    if ((one1 && !one2) || (one2 && !one1)) {numSteps = 3};
    if (!zero1 && !one1 && !zero2 && !one2) {numSteps = 4};

    let typeA = (findRank(a1, b1)).type;
    let typeB = (findRank(a2, b2)).type;

    /*if (transformation.includes("double") || transformation.includes("quadruple")) {
        numSteps += 1;
    } else if (!(transformation.includes("default"))) {
        numSteps += 2;
    };*/

    const screen = new paper.Group();

    for (let i = 0; i < stepData[numSteps - 1].length; i++) {
        const translate = stepData[numSteps - 1][i];

        // Create a rectangle for each coordinate
        const border = new paper.Path.Rectangle({
            from: new paper.Point(translate[0], translate[1]),
            to: new paper.Point(translate[0] + stepSize, translate[1] + stepSize),
            strokeColor: 'black',
            strokeWidth: 1,
        });

        stepOneRedo(w1, h1, w2, h2, stepSize, 0, translate, i+1)

        screen.addChild(border);
    }

    if (numSteps === 3) {
        if (!zero1 && !one1) {
            revampAgain(a1, b1, w1, h1, typeA, 1, stepSize, stepSize, 0, stepData[2][1]);
            revampAgain(a1, b1, w1, h1, typeA, 2, stepSize, stepSize, 0, stepData[2][2]);
        } else if (!zero2 && !one2) {
            revampAgain(a2, b2, w2, h2, typeB, 1, -stepSize, stepSize, 0, stepData[2][1]);
            revampAgain(a2, b2, w2, h2, typeB, 2, -stepSize, stepSize, 0, stepData[2][2]);
        }
    }

    if (numSteps === 4) {
        revampAgain(a1, b1, w1, h1, typeA, 1, stepSize, stepSize, 0, stepData[3][1]);
        revampAgain(a1, b1, w1, h1, typeA, 2, stepSize, stepSize, 0, stepData[3][2]);
        revampAgain(a1, b1, w1, h1, typeA, 3, stepSize, stepSize, 0, stepData[3][3]);
        revampAgain(a2, b2, w2, h2, typeB, 1, -stepSize, stepSize, 0, stepData[3][2]);
        revampAgain(a2, b2, w2, h2, typeB, 2, -stepSize, stepSize, 0, stepData[3][3]);
    }
    
    let aFinal = a, bFinal = b, cFinal = c;
    let aInt = elev[0], bInt = elev[1], cInt = elev[2];

    [aFinal, bFinal, cFinal] = normalize(aFinal, bFinal, cFinal);
    [aInt, bInt, cInt] = normalize(aInt, bInt, cInt);

    const elevationFinal = inverse(aFinal, bFinal, cFinal);
    const elevationFinalCoord = summup(elevationFinal[0], elevationFinal[1], elevationFinal[2])
    const elevInt = inverse(aInt, bInt, cInt);
    const elevIntCoord = summup(elevInt[0], elevInt[1], elevInt[2]);

    searchVi(globalVi, elevationFinalCoord, 10 ** -8, scale, offsetX, offsetY);

    if (xory == 'X') {
        dSLs.x = (stepData[numSteps-1][0] - (stepSize/2));
        dSLs.y = (stepData[numSteps-1][0] - stepSize/2 + targetElev*stepSize);
        dSLf.x = (stepData[numSteps-1][0] + (stepSize/2));
        dSLf.y = (stepData[numSteps-1][0] - stepSize/2 + targetElev*stepSize);
    } else {
        dSLs.x = (stepData[numSteps-1][1] - (stepSize/2) + targetElev*stepSize);
        dSLs.y = (stepData[numSteps-1][1] - stepSize/2);
        dSLf.x = (stepData[numSteps-1][1] - (stepSize/2) + targetElev*stepSize);
        dSLf.y = (stepData[numSteps-1][1] + stepSize/2);
    }

    var desiredLine = new paper.Path.Line ({
        from: dSLs,
        to: dSLf,
        strokeColor: 'red',
        strokeWidth: 1,
    });
}

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

function stepOneRedo(w1, h1, w2, h2, scale, rotate, translate, time) {
    
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

    var prelimGroup = new paper.Group(border);

    function linePusher(arr) {
        for (let i=0; i<arr.length; i++) {
            var lineToBePushed = new paper.Path.Line(arr[i][0],arr[i][1]);
            prelimGroup.addChild(lineToBePushed);
        }
    }

    let pointBucket = [];

    if (one1 && one2) {
        if (Math.abs(w1/h1 - 1) < tolerance) {
            //A
            if (Math.abs(w2/h2 - (Math.SQRT2 - 1))<tolerance) {pointBucket.push([bl,tr],[tl,br],[br,tt])};
            //B
            if (Math.abs(w2/h2 - (2 - Math.SQRT2))<tolerance) {pointBucket.push([bl,tr], [bl,to], [br,to])};
        }

        if (Math.abs(w2/h2 - 1)<tolerance) {
            //C
            if (Math.abs(w1/h1 - (1 + Math.SQRT2/2))<tolerance) {pointBucket.push([tl,br], [tl,rt], [bl,rt])};
            //D
            if (Math.abs(w1/h1 - (Math.SQRT2+1))<tolerance) {pointBucket.push([tl,br], [lo,br], [bl,tr])};
        }

        if (Math.abs(w1/h1-(Math.SQRT2+1))<tolerance) {
            //G
            if (Math.abs(w2/h2-(Math.SQRT2-1))<tolerance) {pointBucket.push([bl,tr],[bl,ro],[tt,br])};
            //I
            if (Math.abs(w2/h2-(2 - Math.SQRT2))<tolerance) {pointBucket.push([bl,tr], [bl,to],[bl,ro],[to,br])};
            //J
            if (Math.abs(w2/h2-(1 + Math.SQRT2/2))<tolerance) {pointBucket.push([tl,br], [tl,rt], [br,lo], [bl,rt])};
        }

        if (Math.abs(w1/h1-(1 + Math.SQRT2/2))<tolerance) {
            //F
            if (Math.abs(w2/h2-(Math.SQRT2-1))<tolerance) {pointBucket.push([tl,br],[tl,rt],[br,to],[bl,rt])};
            //H
            if (Math.abs(w2/h2-(2 - Math.SQRT2))<tolerance) {pointBucket.push([tl,br], [tl,rt], [bl,rt],[to,br])};
        }
    }

    if (zero1 || zero2) {
        if (one1 || one2) {
            if (Math.abs(Math.max(w1/h1, w2/h2) - (math.SQRT2 + 1))<tolerance) {pointBucket.push([bl,tr],[bl,ro])};
            if (Math.abs(Math.max(w1/h1, w2/h2) - (1 + Math.SQRT2/2))<tolerance) {pointBucket.push([bl,tr],[tr,lt])};
        } else {
            if (Math.abs(w1/h1 - (Math.SQRT2+1))<tolerance || (Math.abs(w2/h2 - (Math.SQRT2+1))<tolerance)) {pointBucket.push([tl,br], [lo,br], [lo,ro])};
            if (Math.abs(w1/h1 - (1 + Math.SQRT2/2))<tolerance || w2/h2 - (1 + Math.SQRT2/2)<tolerance) {pointBucket.push([tl,br], [tl,rt], [lt,rt])};
            if (Math.abs(w2/h2 - (Math.SQRT2 - 1))<tolerance || Math.abs(w1/h1 - (2-Math.SQRT2))<tolerance) {pointBucket.push([bl,tr], [tr,bt], [tt,bt])};
            if (Math.abs(w2/h2 - (2 - Math.SQRT2))<tolerance || Math.abs(w1/h1 - (Math.SQRT2 - 1))<tolerance) {pointBucket.push([bl,tr], [bl,to], [to,bo])};
        }
    }

    if (!zero1 && !zero2 && !one1 && !one2){
        if (Math.abs(w1/h1 - 1) < tolerance) {
            //A
            if (Math.abs(w2/h2 - (Math.SQRT2 - 1))<tolerance) {pointBucket.push([bl,tr], [tr,bt], [tt,bt])};
            //B
            if (Math.abs(w2/h2 - (2 - Math.SQRT2))<tolerance) {pointBucket.push([bl,tr], [bl,to], [to,bo])};
        }

        if (Math.abs(w2/h2 - 1)<tolerance) {
            //C
            if (Math.abs(w1/h1 - (1 + Math.SQRT2/2))<tolerance) {pointBucket.push([tl,br], [tl,rt], [lt,rt])};
            //D
            if (Math.abs(w1/h1 - (Math.SQRT2+1))<tolerance) {pointBucket.push([tl,br], [lo,br], [lo,ro])};
        }

        //E
        if (Math.abs(w1/h1 - (2-Math.SQRT2))<tolerance && Math.abs(w2/h2-(Math.SQRT2 - 1))<tolerance) {pointBucket.push([tl,br], [br,tt], [tt,bt])};

        if (Math.abs(w1/h1-(Math.SQRT2+1))<tolerance) {
            //G
            if (Math.abs(w2/h2-(Math.SQRT2-1))<tolerance) {pointBucket.push([tl,br], [br,tt], [tt,bt], [lo,ro])};
            //I
            if (Math.abs(w2/h2-(2 - Math.SQRT2))<tolerance) {pointBucket.push([bl,tr], [bo,to], [lo,ro], [bl,ro])};
            //J
            if (Math.abs(w2/h2-(1 + Math.SQRT2/2))<tolerance) {pointBucket.push([tl,br], [lo,ro], [lt,rt], [tl,rt], [br,lo])};
        }

        if (Math.abs(w1/h1-(1 + Math.SQRT2/2))<tolerance) {
            //F
            if (Math.abs(w2/h2-(Math.SQRT2-1))<tolerance) {pointBucket.push([bl,tr], [bt,bt], [rt,lt], [tt,bt])};
            //H
            if (Math.abs(w2/h2-(2 - Math.SQRT2))<tolerance) {pointBucket.push([tl,br], [tl,rt], [to,bo], [rt,lt])};
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