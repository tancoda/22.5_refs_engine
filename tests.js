// PART ONE: Generates the farey sequence of all fractions having a denominator less than or equal to n.
// Each fraction corresponds to a slope.  The lookup table records the number of creases required
// to develop that slope, and the methodology used to do so.

let lookupTable = [];

//input max denominator, assumed to be 100
const n = 100;
//input most extreme fraction
const m = 50;

function gcd(a, b) {
    if (b) {
        return gcd(b, a % b);
    } else {
        return Math.abs(a);
    }
}

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
    } else return null
}

// Generate the Farey sequence
for (let b = 1; b <= n; b++) {
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
    if (numerator/denominator < 0) {
        [numerator, denominator] = [-numerator, -denominator]
    }
    //performs regular search
    if (numerator === 0) {
        return 0;
    } else if (numerator/denominator === 1){
        return 1;
    } else if (denominator/numerator > m || numerator/denominator > m){
        return null;
    }
    else {
        let result = lookupTable.find(row => row.numerator === numerator && row.denominator === denominator);
        return result ? result.rank : null;  // Return the rank if found, otherwise return null
    }
}

// Function you can call later to search after data is loaded
function searchForFraction(numerator, denominator) {
    if (denominator <= n && numerator <= n) {
        return findRank(numerator/gcd(numerator,denominator), denominator/gcd(numerator,denominator));
    } else {
        return Infinity;
    }
}

const quid = 200;
let counts = {
    a1: 0, b1: 0, c1: 0, d: 0, e: 0, f: 0, 
    g: 0, p: 0, gen: 0
};

for (let a = 0; a < quid; ++a) {
    for (let b = 0; b < quid; ++b) {
        let counter = type(a,b);

        switch (counter) {
            case "diagA":
                counts.a1 += 1;
                break;
            case "diagB":
                counts.b1 += 1;
                break;
            case "diagC":
                counts.c1 += 1;
                break;
            case "diagD":
                counts.d += 1;
                break;
            case "diagE":
                counts.e += 1;
                break;
            case "diagF":
                counts.f += 1;
                break;
            case "diagG":
                counts.g += 1;
                break;
            case "powTwo":
                counts.p += 1;
                break;
            case "general":
                counts.gen += 1;
                break;
        }
    }
}

// Log results
console.log( 
    "A: " + counts.a1, 
    "B: " + counts.b1, 
    "C: " + counts.c1, 
    "D: " + counts.d, 
    "E: " + counts.e, 
    "F: " + counts.f, 
    "G: " + counts.g, 
    "powTwo: " + counts.p, 
    "general: " + counts.gen
);

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

/*const quid = 50;
let counts = {
    a1: 0, b1: 0, c1: 0, d: 0, e: 0, f: 0, 
    g: 0, h: 0, i: 0, j: 0
};

for (let a = -quid; a < quid; ++a) {
    for (let b = -quid; b < quid; ++b) {
        for (let c = 0; c < (2 * quid); ++c) {
            if (summup(a, b, c) > 1) {
                let counter = rankIt(a, b, c);

                switch (counter[0]) {
                    case "A":
                        counts.a1 += 1;
                        break;
                    case "B":
                        counts.b1 += 1;
                        break;
                    case "C":
                        counts.c1 += 1;
                        break;
                    case "D":
                        counts.d += 1;
                        break;
                    case "E":
                        counts.e += 1;
                        break;
                    case "F":
                        counts.f += 1;
                        break;
                    case "G":
                        counts.g += 1;
                        break;
                    case "H":
                        counts.h += 1;
                        break;
                    case "I":
                        counts.i += 1;
                        break;
                    case "J":
                        counts.j += 1;
                        break;
                }
            }
        }
    }
}

// Log results
console.log( 
    "A: " + counts.a1, 
    "B: " + counts.b1, 
    "C: " + counts.c1, 
    "D: " + counts.d, 
    "E: " + counts.e, 
    "F: " + counts.f, 
    "G: " + counts.g, 
    "H: " + counts.h, 
    "I: " + counts.i, 
    "J: " + counts.j, 
);
*/

//------------------------------------------------------------------------------------------------------------------------------

function summup(a,b,c) {
    return (a + (b * Math.SQRT2)) / c
}

function arcctg(x) { return Math.PI / 2 - Math.atan(x) };

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
    const bisectorType = createRankType('bisector', bisectorValues, 1);

    // SwitchIt and negSwitchIt
    const switchItValues = findSwitchIt(a, b, c);
    const switchItType = createRankType('switchIt', switchItValues, 1);

    // HSA and negHSA
    const hsaValues = findHSA(a, b, c);
    const hsaType = createRankType('HSA', hsaValues, 1);

    // HSB and negHSB
    const hsbValues = findHSB(a, b, c);
    const hsbType = createRankType('HSB', hsbValues, 1)

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
    return [minType.name, minType.meth, minType.value, minType.elev];
}

//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));
//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));
//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));
//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));
//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));
//console.log(alts(Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)));

/*const quid = 50;
let counts = {
    df: 0, ndf: 0, db: 0, ndb: 0, q: 0, nq: 0, 
    s: 0, ns: 0, hb: 0, nhb: 0, ha: 0, nha: 0
};

for (let a = -quid; a < quid; ++a) {
    for (let b = -quid; b < quid; ++b) {
        for (let c = 0; c < (2 * quid); ++c) {
            if (summup(a, b, c) > 1) {
                let counter = alts(a, b, c);

                switch (counter[0]) {
                    case "default":
                        counts.df += 1;
                        break;
                    case "negdefault":
                        counts.ndf += 1;
                        break;
                    case "double":
                        counts.db += 1;
                        break;
                    case "negdouble":
                        counts.ndb += 1;
                        break;
                    case "quadruple":
                        counts.q += 1;
                        break;
                    case "negquadruple":
                        counts.nq += 1;
                        break;
                    case "switchIt":
                        counts.s += 1;
                        break;
                    case "negswitchIt":
                        counts.ns += 1;
                        break;
                    case "HSB":
                        counts.hb += 1;
                        break;
                    case "negHSB":
                        counts.nhb += 1;
                        break;
                    case "HSA":
                        counts.ha += 1;
                        break;
                    case "negHSA":
                        counts.nha += 1;
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

// Log results
console.log("df: " + counts.df, 
    "ndf: " + counts.ndf, 
    "db: " + counts.db, 
    "ndb: " + counts.ndb, 
    "q: " + counts.q, 
    "nq: " + counts.nq, 
    "s: " + counts.s, 
    "ns: " + counts.ns, 
    "hb: " + counts.hb, 
    "nhb: " + counts.nhb, 
    "ha: " + counts.ha, 
    "nha: " + counts.nha
);
*/