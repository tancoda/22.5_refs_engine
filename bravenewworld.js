function scrawler(a1, b1, w1, h1, type1, a2, b2, w2, h2, type2) {
    let zero1 = (a1 === 0 || b1 === 0 || a1 === -0 || b1 === -0);
    let one1 = (a1/b1 === 1);
    let diag1 = false;

    let zero2 = (a2 === 0 || b2 === 0 || a2 === -0 || b2 === -0);
    let one2 = (a2/b2 === 1);
    let diag2 = false;

    let precrease = false;

    [w1, h1] = scaler(w1, h1);
    [w2, h2] = scaler(w2, h2);

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

    //if (xory === 'Y') {rotate -= 90};
    //if (name.includes('neg')) {rotate += 180};

    //searchVi(globalVi, elevationFinalCoord, 10 ** -8, cPScale, cPOffsetX, cPOffSetY);

    updateInfoText();

    let preCreaseLineArr = [], preCreaseArr = [];

    let diag1Group = diag(a1, b1, w1, h1, 0, false);
    let diag2Group = diag(a2, b2, w2, h2, 0, true);

    let c1S = new paper.Point(0,0), c1F = new paper.Point(1,1);
    let c2S = new paper.Point(1,0), c2F = new paper.Point(1,1);

    if (one1) {
        preCreaseLineArr.push([[0,0],[w1,h1]]);
        preCreaseArr.push(new paper.Point(w1, h1));
        c1F = new paper.Point(w1, h1);
        console.log("one1");
    } else if (zero1) {
        console.log("zero1");
    } else {
        diag1 = true;
        preCreaseArr.push(diag1Group[1]);
        c1F = diag1Group[0]._children[0].segments.slice(-1)[0].point;
        console.log("diag1");
    }

    if (one2) {
        preCreaseLineArr.push([[1,0],[1-w2,h2]]);
        preCreaseArr.push(new paper.Point(1-w2, h2));
        c2F = new paper.Point(1-w2, h2);
        console.log("one2");
    } else if (zero2) {
        console.log("zero2");
    } else {
        diag2 = true;
        preCreaseArr.push(diag2Group[1]);
        c2F = diag2Group[0]._children[0].segments.slice(-1)[0].point
        console.log("diag2");
    }

    if ((diag1 && diag2) || (diag1 && !(type1 === 'powTwo' && tolerantSame(w1, h1))) || (diag2 && !(type2 === 'powTwo' && tolerantSame (w2, h2)))) {
        console.log("sending");
        preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        precrease = true;
    };

    let preCreaseGroup = new paper.Group();

    let stepCount = [];

    const stepData = stepper[stepCount.length - 1];

    if (precrease) {stepCount.push('precrease')};
    if (diag1) {stepCount.push('diag1')};
    if (diag2) {stepCount.push('diag2')}

    if (preCreaseLineArr) {linePusher(preCreaseLineArr, preCreaseGroup, time)};

    function borderFactory(numSteps) {
        const border = new paper.Path.Rectangle({
            from: new paper.Point(stepData[numSteps][0], stepData[numSteps][1]),
            to: new paper.Point(stepData[numSteps][0] + stepSize, stepData[numSteps][1] + stepSize),
            strokeColor: 'black',
            strokeWidth: 1,
        });
        return border;
    }

    let screen = new paper.Group();

    let precreaseIndex = stepCount.indexOf('precrease');
    let diag1Index = stepCount.indexOf('diag1');
    let diag2Index = stepCount.indexOf('diag2');

    let precreases = new paper.Group();
    let diagonals1, diagonals2;

    for (let i = 0; i < stepCount.length; i++) {
        let thisStep = new paper.Group();

        if (precreaseIndex !== -1) {
            linePusher(preCreaseLineArr, precreases, i - precreaseIndex);
            thisStep.addChild(...precreases.children);
        }
        if (diag1Index !== -1) {
            diagonals1 = diag(a1, b1, w1, h1, i - diag1Index, false);
            thisStep.addChild(...diagonals1.children);
        }
        if (diag2Index !== -1) {
            diagonals2 = diag(a2, b2, w2, h2, i - diag2Index, true);
            thisStep.addChild(...diagonals2.children);
        }

        thisStep.pivot = new paper.Point(0.5, 0.5);
        thisStep.scale(stepSize, stepSize);
        thisStep.position = new paper.Point(stepData[i][0] + stepSize / 2, stepData[i][1] + stepSize / 2);
        thisStep.strokeWidth = 1;
        thisStep.visible = true;

        borderFactory(i);

        screen.addChild(thisStep);
    }
}





/////////////////////////////////////////////////old one

function scrawler(a1, b1, w1, h1, type1, a2, b2, w2, h2, type2) {
    let zero1 = (a1 === 0 || b1 === 0 || a1 === -0 || b1 === -0);
    let one1 = (a1/b1 === 1);
    let zero2 = (a2 === 0 || b2 === 0 || a2 === -0 || b2 === -0);
    let one2 = (a2/b2 === 1);

    [w1, h1] = scaler(w1, h1);
    [w2, h2] = scaler(w2, h2);

    let preCreaseLineArr = [], preCreaseArr = [];

    if (one1) {
        preCreaseLineArr.push([[0,0],[w1,h1]]);
        preCreaseArr.push(new paper.Point(w1, h1));
        console.log("one1");
    }
    if (one2) {
        preCreaseLineArr.push([[1,0],[1-w2,h2]]);
        preCreaseArr.push(new paper.Point(1-w2, h2));
        console.log("one2");
    }
    if (zero1) {console.log("zero1")};
    if (zero2) {console.log("zero2")};

    let diag1Group = diag (a1, b1, w1, h1, 0, false);

    console.log(diag1Group[0]._children[0].segments.slice(-1)[0].point)

    let diag2Group = diag (a2, b2, w2, h2, 0, true);

    console.log(diag1Group);
    console.log(diag2Group);

    if (!zero1 && !one1 && diag1Group[1]) {
        preCreaseArr.push(diag1Group[1]);
        //console.log("precreasing for diag1: " + diag1Group[1]);
    };
    if (!zero2 && !one2 && diag2Group[1]) {
        preCreaseArr.push(diag2Group[1]);
        //console.log("precreasing for diag2: " + diag2Group[1]);
    };

    console.log(preCreaseArr);

    console.log(preCreaseLineArr);

    if (preCreaseArr.length > 0 && !preCreaseArr.includes(undefined) ) {
        if (preCreaseArr[0].length > 0) {
            console.log("sending");
            preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        }
    };

    let preCreaseGroup = new paper.Group();

    console.log(preCreaseLineArr);

    if (preCreaseLineArr) {linePusher(preCreaseLineArr, preCreaseGroup, 0)};

    console.log(preCreaseGroup);

    let steps = [];

    if (preCreaseGroup._children.length > 0) {
        console.log(preCreaseGroup._children);
        steps.push(preCreaseGroup);
    };
    if (diag1Group[0]) {
        console.log(diag1Group[0]);
        steps.push(diag1Group[0]);
    };
    if (diag2Group[0]) {
        console.log(diag2Group[0]);
        steps.push(diag2Group[0])
    };

    console.log(steps);

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

    const stepData = stepper[steps.length-1];

    //if (xory === 'Y') {rotate -= 90};
    //if (name.includes('neg')) {rotate += 180};

    //searchVi(globalVi, elevationFinalCoord, 10 ** -8, cPScale, cPOffsetX, cPOffSetY);

    updateInfoText();

    function borderFactory(numSteps) {
        const border = new paper.Path.Rectangle({
            from: new paper.Point(stepData[numSteps][0], stepData[numSteps][1]),
            to: new paper.Point(stepData[numSteps][0] + stepSize, stepData[numSteps][1] + stepSize),
            strokeColor: 'black',
            strokeWidth: 1,
        });
        return border;
    }

    let screen = new paper.Group();

    for (let i = 0; i < steps.length; i++) {

        let thisStep = steps[i];

        console.log(typeof thisStep);

        thisStep.pivot = new paper.Point(0.5, 0.5);
        thisStep.scale(stepSize, stepSize);
        thisStep.position = new paper.Point(stepData[i][0] + stepSize/2, stepData[i][1] + stepSize/2);
        thisStep.strokeWidth = 1;
        thisStep.visible = true;

        borderFactory(i);

        screen.addChild(thisStep);
    }
}