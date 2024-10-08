if ((one1 || zero1) && (one2 || zero2)) {
    //handles 1/1 & 1/0
    [preCreaseLineArr, interPt] = oneZero(one1, one2, zero1, zero2, w1, h1, w2, h2);
    linePusher(preCreaseLineArr, precreaseStep0, 0);
    linePusher(preCreaseLineArr, precreaseStep1, 1);

    let interDot = dot(interPt, 0);
    let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
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
    if (one1) {
        [c1S.x, c1S.y, c1F.x, c1F.y] = [0, 0, w1, h1];
        preCreaseArr.push(...[w1, h1]);
        preCreaseLineArr.push(...[[0,0],[w1,h1]]);
        [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
        interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);
        preCreaseArr.push (diag10obj.pointsPrelim);

        diag2Step0 = diag20obj.drawnGroup;
        diag2Step1 = diag21obj.drawnGroup;

        uniq_fast(preCreaseArr);
        if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        uniq_fast(preCreaseLineArr);
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);

        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)

        rank = precreaseStep1._children.length + diag21obj.rank + 1;
    } else {
        [c2S.x, c2S.y, c2F.x, c2F.y] = [1, 0, 1-w1, h1];
        preCreaseArr.push(...[1-w1, h1]);
        preCreaseLineArr.push(...[[1,0],[1-w1,h1]]);

        [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
        interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);
        preCreaseArr.push (diag10obj.pointsPrelim);

        diag1Step0 = diag10obj.drawnGroup;
        diag1Step1 = diag11obj.drawnGroup;

        uniq_fast(preCreaseArr);
        if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        uniq_fast(preCreaseLineArr);
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);

        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)

        rank = precreaseStep1._children.length + diag11obj.rank + 1;
    }

    if (precreaseStep0) {steps.push([precreaseStep0, precreaseStep1])};
    if (diag1Step0)     {steps.push([diag1Step0, diag1Step1])};
    if (diag2Step0)     {steps.push([diag2Step0, diag2Step1])};
    if (intStep0)       {steps.push([intStep0, intStep1])};

} else if (zero1 || zero2) {
    //handles 0/2 (need powTwo case)
    if (zero1) {
        [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
        interPt = c2F.clone();
        preCreaseArr.push (diag20obj.pointsPrelim);
        
        diag2Step0 = diag20obj.drawnGroup;
        diag2Step1 = diag21obj.drawnGroup;

        if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);

        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)

        if (findRank(a2, b2).rank === 'powTwo' && (a2 > b2 === w2 > h2 || tolerantSame (w2, h2))) {
            if (tolerantSame (w2, h2)) {
                precreaseStep0 = null, precreaseStep1 = null;
                intStep0 = null, intStep1 = null;
                diag2Step0._children[0].visible = false;
                diag2Step1._children[0].visible = false;
                diag2Step0.addChild(interLine0);
                diag2Step1.addChild(interLine1);

                rank = diag21obj.rank;
                steps = [[diag2Step0, diag2Step1]];
            } else if (a2 > b2 === w2 > h2) {
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
        [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
        interPt = c1F.clone();
        preCreaseArr.push (diag10obj.pointsPrelim);
        
        diag1Step0 = diag10obj.drawnGroup;
        diag1Step1 = diag11obj.drawnGroup;

        if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
        linePusher(preCreaseLineArr, precreaseStep0, 0);
        linePusher(preCreaseLineArr, precreaseStep1, 1);

        let interDot = dot(interPt, 0);
        let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
        interLine0.style = styleTime0;
        let interLine1 = interLine0.clone();
        interLine1.style = styleTime1;
        intStep0 = new paper.Group (interDot, interLine0);
        intStep1 = new paper.Group (interLine1)

        if (findRank(a1, b1).rank === 'powTwo' && (a1 > b1 === w1 > h1 || tolerantSame (w1, h1))) {
            if (tolerantSame (w1, h1)) {
                precreaseStep0 = null, precreaseStep1 = null;
                intStep0 = null, intStep1 = null;
                diag1Step0._children[0].visible = false;
                diag1Step1._children[0].visible = false;
                diag1Step0.addChild(interLine0);
                diag1Step1.addChild(interLine1);

                rank = diag11obj.rank;
                steps = [[diag1Step0, diag1Step1]];
            } else if (a1 > b1 === w1 > h1) {
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
    [c1S.x, c1S.y, c1F.x, c1F.y] = diag10obj.diagonal;
    preCreaseArr.push (diag10obj.pointsPrelim);
    diag1Step0 = diag10obj.drawnGroup;
    diag1Step1 = diag11obj.drawnGroup;

    [c2S.x, c2S.y, c2F.x, c2F.y] = diag20obj.diagonal;
    preCreaseArr.push (diag20obj.pointsPrelim);
    diag2Step0 = diag20obj.drawnGroup;
    diag2Step1 = diag21obj.drawnGroup;

    interPt = intersect(c1S.x, c1S.y, c1F.x, c1F.y, c2S.x, c2S.y, c2F.x, c2F.y);

    uniq_fast(preCreaseArr);
    if (findCreaseArr(preCreaseArr)) preCreaseLineArr.push (...findCreaseArr(preCreaseArr));
    linePusher(preCreaseLineArr, precreaseStep0, 0);
    linePusher(preCreaseLineArr, precreaseStep1, 1);

    let interDot = dot(interPt, 0);
    let interLine0 = new paper.Path (new paper.Point(0, interDot.y), new paper.Point(1, interDot.y));
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







//---------------------------------------------------------------


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
                    let [nega, negb, negc] = negate(a, b, c);

                    let set = [[a, b, c, 'default'], [nega, negb, negc, 'negdefault']];

                    let targArr = [];

                    for (let i = 0; i < set.length; i++) {
                        if (eligibleA(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'A', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'A')).rank])};
                        if (eligibleB(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'B', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'B')).rank])};
                        if (eligibleC(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'C', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'C')).rank])};
                        if (eligibleD(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'D', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'D')).rank])};
                        if (eligibleE(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'E', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'E')).rank])};
                        if (eligibleF(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'F', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'F')).rank])};
                        if (eligibleG(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'G', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'G')).rank])};
                        if (eligibleH(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'H', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'H')).rank])};
                        if (eligibleI(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'I', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'I')).rank])};
                        if (eligibleJ(set[i][0], set[i][1], set[i][2])) {targArr.push([set[i][3], 'J', (newDiags(set[i][0], set[i][1], set[i][2], set[i][3], 'J')).rank])};
                    }

                    console.log ([a, b, c, targArr]);

                    return [a, b, c, targArr];
                });
            }

            C2 = updateC2(C2);

            /*

            function isReasonable (element) {
                return ((summup (element[0], element[1], element[2]) < (defaultValue2 ** -1)) && (summup (element[0], element[1], element[2]) > ((1 - defaultValue2) ** -1)))
            }

            C2 = C2.filter(isReasonable);

            C2.sort((a, b) => {
                if (a === undefined || b === undefined) return Infinity; // Handle undefined values
                return (a[4][0][2] || 0) - (b[4][0][2] || 0); // Compare minType.value (index 5)
            });*/

            globalC2 = C2

            console.log(C2);

            console.log(C2);
            resolve(C2);
        } catch (error) {
            reject(error);
        }
    });
}