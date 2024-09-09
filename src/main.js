import { M } from "./flatfolder/math.js";
import { NOTE } from "./flatfolder/note.js";
import { SVG } from "./flatfolder/svg.js";
import { X } from "./flatfolder/conversion.js";
import { AVL } from "./flatfolder/avl.js";
import { IO } from "./flatfolder/io.js";
import { lookupTable } from "./slope_generator.js";

window.onload = () => { MAIN.startup(); };  // entry point

const MAIN = {
    color: {
        background: "lightgray",
        paper: "white",
        B: "black",
        M: "red",
        V: "blue",
        F: "gray",
        U: "yellow",
        C: "green",
    },
    size: {
        b: 50,
        s: SVG.SCALE,
    },
    startup: () => {
        NOTE.clear_log();
        NOTE.start("*** Starting CP Analyzer ***");
        NOTE.time("Initializing interface");
        const [b, s] = [MAIN.size.b, MAIN.size.s];
        const main = document.getElementById("main");
        for (const [k, v] of Object.entries({
            xmlns: SVG.NS,
            style: `background: ${MAIN.color.background}`,
            viewBox: [0, 0, 2*s, s].join(" "),
        })) {
            main.setAttribute(k, v);
        }
        for (const [i, id] of ["input", "output"].entries()) {
            const svg = document.getElementById(id);
            for (const [k, v] of Object.entries({
                xmlns: SVG.NS,
                height: s,
                width: s,
                x: i*s,
                y: 0,
                viewBox: [-b, -b, s + 2*b, s + 2*b].join(" "),
            })) {
                svg.setAttribute(k, v);
            }
        }
        document.getElementById("import").onchange = (e) => {
            if (e.target.files.length > 0) {
                const file_reader = new FileReader();
                file_reader.onload = MAIN.process_file;
                file_reader.readAsText(e.target.files[0]);
            }
        };
    },
    process_file: (e) => {
        NOTE.clear_log();
        NOTE.start("*** Starting File Import ***");
        const doc = e.target.result;
        const file_name = document.getElementById("import").value;
        const parts = file_name.split(".");
        const type = parts[parts.length - 1].toLowerCase();
        NOTE.time(`Importing from file ${file_name}`);
        const [V_org, VV, EVi, EAi, EF, FV, FE] =
            IO.doc_type_side_2_V_VV_EV_EA_EF_FV_FE(doc, type, true);
        const Vi = M.normalize_points(V_org);
        const EPS = 10**(-8);
        const [C, VC] = MAIN.V_2_C_VC(Vi, EPS);
        const target = {C, VC, EV: EVi, EA: EAi, FV};
        MAIN.update(target, SVG.clear("input"), EPS);
    },
    V_2_C_VC: (V, eps) => {
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
    },
    update: (FOLD, svg, eps) => {
        const {C, VC, EV, EA, FV} = FOLD;
        SVG.append("rect", svg, {
            x: 0,
            y: 0,
            width: MAIN.size.s,
            height: MAIN.size.s,
            fill: MAIN.color.paper,
        });
        const grid_radio = document.getElementById("grid");
        const pi_8_radio = document.getElementById("pi_8");
        const V = VC.map(c => M.expand(c, C));
        const lines = EV.map(l => M.expand(l, V));
        const back_svg = SVG.append("g", svg, {id: "back_svg"});
        const line_svg = SVG.append("g", svg, {id: "line_svg"});
        const front_svg = SVG.append("g", svg, {id: "front_svg"});
        for (const t of ["B", "M", "V", "F", "U"]) {
            SVG.draw_segments(line_svg, lines, {
                id: `flat_e_boundary`, stroke: MAIN.color[t], stroke_width: 1,
                filter: (i) => EA[i] == t,
            });
        }
        grid_radio.onchange = (e) => MAIN.update_radio(C, VC, EV, EA, FV, eps);
        pi_8_radio.onchange = (e) => MAIN.update_radio(C, VC, EV, EA, FV, eps);
        MAIN.update_radio(C, VC, EV, EA, FV, eps);
    },
    output_fixed: (C, VC, EV, EA, FV, g) => {
        const C_ = C.map(c => Math.round(c*g));
        const V = VC.map(vC => M.expand(vC, C_));
        const path = document.getElementById("import").value.split("\\");
        const name = path[path.length - 1].split(".")[0];
        const FOLD = {
            file_spec: 1.1,
            file_creator: "cp_analyzer",
            file_title: name,
            file_classes: ["singleModel"],
            vertices_coords:  V,
            edges_vertices:   EV,
            edges_assignment: EA,
            faces_vertices:   FV,
        };
        const data = new Blob([JSON.stringify(FOLD, undefined, 2)], {
            type: "application/json"});
        const ex = SVG.clear("export");
        const link = document.createElement("a");
        const button = document.createElement("input");
        ex.appendChild(link);
        link.appendChild(button);
        link.setAttribute("download", `${name}.fold`);
        link.setAttribute("href", window.URL.createObjectURL(data));
        button.setAttribute("type", "button");
        button.setAttribute("value", "Export");
    },
    update_radio: (C, VC, EV, EA, FV, eps) => {
        const ex = SVG.clear("export");
        const grid_radio = document.getElementById("grid");
        const grid_select = SVG.clear("grid_select");
        const complex = document.getElementById("complex");
        complex.textContent = "";
        const coords = document.getElementById("coords");
        coords.textContent = "";
        SVG.clear("back_svg");
        SVG.clear("front_svg");
        if (grid_radio.checked) {
            grid_select.style.display = "inline";
            const G = MAIN.grid_size(C, eps);
            const M = new Map(G);
            G.sort(([g1, n1], [g2, n2]) => n2*n2/g2 - n1*n1/g1);
            for (let i = 0; i < G.length; ++i) {
                const [g, count] = G[i];
                const per = Math.round(100*count/C.length);
                const el = document.createElement("option");
                el.setAttribute("value", g);
                el.textContent = `Grid ${g}: ${per}% coverage`;
                grid_select.appendChild(el);
            }
            grid_select.onchange = (e) => {
                const g = +e.target.value;
                const n = M.get(g);
                MAIN.update_grid(g, C, VC, eps);
                if (M.get(g) == C.length) {
                    MAIN.output_fixed(C, VC, EV, EA, FV, g);
                }
            };
            const g = G[0][0];
            MAIN.update_grid(g, C, VC, eps);
            if (M.get(g) == C.length) {
                MAIN.output_fixed(C, VC, EV, EA, FV, g);
            }
        } else {
            grid_select.style.display = "none";
            const svg = SVG.clear("front_svg");
            // for (const c of C) {
            //     const D = pi_8_coord(c);
            // }
            const C2 = check_pi_8(C, 10**(-8));
            const cov = C2.reduce((a, c) => a + ((c == undefined) ? 0 : 1), 0);
            const per = Math.round(100*cov/C2.length);
            const m = VC.reduce((a, [ci, cj]) => {
                if ((C2[ci] == undefined) || (C2[cj] == undefined)) { return a; }
                return Math.max(a,
                    C2[ci].reduce((b, x) => b + Math.abs(x), 0),
                    C2[cj].reduce((b, x) => b + Math.abs(x), 0)
                );
            }, 0);
            complex.textContent = `| Complexity: ${m}, Coverage: ${per}% | `;
            const colors = VC.map(vC => MAIN.color[
                vC.every(i => C2[i] != undefined) ? "C" :"M"]);
            SVG.draw_points(svg, VC.map(([a, b]) => [C[a], C[b]]), {
                id: "points", r: 5, fill: colors
            });
            for (let i = 0; i < VC.length; ++i) {
                const el = document.getElementById(`front_svg${i}`);
                if (el == undefined) { continue; }
                el.onclick = () => {
                    const [c1, c2] = VC[i].map(ci => C2[ci]);
                    const s = `[ ${coord_str(c1)} , ${coord_str(c2)} ]`;
                    coords.textContent = s;
                };
            }
            // const D = MAIN.triangulate(C, VC, EV, eps);
            // if (D != undefined) {
            //     SVG.draw_segments(svg, D, {
            //         id: `diags`, stroke: MAIN.color.C, stroke_width: 1
            //     });
            // }
        }
    },
    update_grid: (g, C, VC, eps) => {
        const svg = SVG.clear("back_svg");
        const el = SVG.append("g", svg);
        const P = [];
        for (let x = 0; x <= g; ++x) {
            for (let y = 0; y <= g; ++y) {
                P.push([x/g, y/g]);
            }
        }
        const r = Math.min(5, SVG.SCALE/g/10);
        SVG.draw_points(el, P, {r, fill: MAIN.color.C});
        const valid = C.map(c => Math.abs(c*g - Math.round(c*g)) < eps);
        for (let i = 0; i < VC.length; ++i) {
            const [u, v] = VC[i];
            if (valid[u] && valid[v]) { continue; }
            SVG.draw_points(el, [[C[u], C[v]]], {r, fill: MAIN.color.M});
        }
    },
    grid_size: (C, eps) => {
        const S = new Set();
        const G = [];
        for (let i = 1; i < 1000; ++i) {
            let count = 0;
            for (const c of C) {
                const c_ = c*i;
                if (Math.abs(c_ - Math.round(c_)) < eps) {
                    ++count;
                }
            }
            if (S.has(count)) { continue; }
            S.add(count);
            G.push([i, count]);
            if (count == C.length) { break; }
        }
        return G;
    },
    triangulate: (C, VC, EV, eps) => {
        const V = VC.map(P => M.expand(P, C));
        const [VV, FV] = X.V_EV_2_VV_FV(V, EV);
        const D = [];
        A: for (const F of FV) {
            const fV = M.expand(F, V);
            let u = fV[fV.length - 1];
            for (const v of fV) {
                if (!MAIN.at_pi_8(M.sub(v, u), eps)) {
                    continue A;
                }
                u = v;
            }
            MAIN.diags(fV, D, eps);
        }
        return D;
    },
    at_pi_8: (v, eps) => {
        const ang = (M.angle(v))/(Math.PI/8);
        return Math.abs(Math.round(ang) - ang) < eps;
    },
    diags: (P, out = [], eps) => {
        const n = P.length;
        if (n == 3) { return true; }
        for (let i = 0; i < n; ++i) {
            const s = (i + 1) % n;
            const j = (i + 2) % n;
            if (MAIN.at_pi_8(M.sub(P[i], P[j]), eps)) {
                out.push([P[i], P[j]]);
                const P_ = P.filter((_, k) => k != s);
                if (MAIN.diags(P_, out, eps)) { return true; }
                out.pop();
            }
        }
        for (let i = 0; i < n; ++i) {
            const s = (i + 1) % n;
            const j = (i + 2) % n;
            if (MAIN.at_pi_8(M.sub(P[i], P[j]), eps)) {
                out.push([P[i], P[j]]);
            }
        }
        return false;
    },
};

const pi_8_coord = (c) => {
    const C = [c];
    const D = [];
    const eps = 0.01;
    const eps2 = 10**(-8);
    const eps3 = 10**(-15);
    let a1, b1, a2 = 1, b2 = 0, c1 = c;
    A: while (true) {
        if (Math.abs(c1 - Math.round(c1)) < eps2) {
            const d = Math.round(c1);
            D.push(d);
            if (a1 == undefined) {
                a1 = d;
                b1 = 1;
            } else {
                [a1, a2] = [d*a1 + a2, a1];
                [b1, b2] = [d*b1 + b2, b1];
            }
            break A;
        }
        const d = Math.floor(c1);
        D.push(d);
        if (a1 == undefined) {
            a1 = d;
            b1 = 1;
        } else {
            [a1, a2] = [d*a1 + a2, a1];
            [b1, b2] = [d*b1 + b2, b1];
        }
        if (Math.abs(a1/b1 - a2/b2) < eps3) { break; }
        c1 = 1/(c1 - d);
        const j = C.length + 1;
        for (let i_ = 0; i_ < C.length; ++i_) {
            if (Math.abs(C[i_] - c1) > eps) { continue; }
            D.push([i_]);
            if (a1 == undefined) {
                a1 = c1;
                b1 = 1;
            } else {
                [a1, a2] = [c1*a1 + a2, a1];
                [b1, b2] = [c1*b1 + b2, b1];
            }
            break A;
        }
        C.push(c1);
    }
    console.log("fraction:", [a1, b1]);
    console.log("coeff:", D);
    console.log(a1/b1);
    console.log(c);
    return D;
};

const r2 = 2**0.5;
const val = ([a, b]) => a + r2*b;
const check_pi_8 = (C, eps) => {
    const T = new AVL((a, b) => {
        return (Math.abs(a - b) < eps) ? 0 : (a - b);
    });
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
                    if (num < 0) { continue; }
                    for (let k = 0; k <= n - i - j; ++k) {
                        const l = n - i - j - k;
                        for (const [c, d] of [[l, k], [-l, k], [l, -k]]) {
                            const den = val([c, d]);
                            if (den <= 0) { continue; }
                            const v = num/den;
                            if (v > 1) { continue; }
                            const u = T.insert(v);
                            if (u == undefined) {
                                M.set(v, [a, b, c, d]);
                            }
                        }
                    }
                }
            }
        }
    }
    let V = [];
    for (const v of C) {
        const u = T.insert(v);
        if (u == undefined) {
            T.remove(v);
            V.push(undefined);
        } else {
            const [a, b, c, d] = M.get(u);
            V.push([a, b, c, d]);
        }
    }
    
    const newElements = [];  // Temporary array to store new elements

    V.forEach(([a, b, c, d]) => {
        const newElement = [(c - a), (d - b), c, d];
        
        // Check if the new element already exists in V
        const exists = V.some(([x, y, z, w]) =>
            x === newElement[0] && y === newElement[1] && z === newElement[2] && w === newElement[3]
        );
    
        // If the new element doesn't exist, push it to the temporary array
        if (!exists) {
            newElements.push(newElement);
        }
    });
    
    // Merge the new elements into V after the loop
    V.push(...newElements);

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
    
    // Apply the transformation and update V
    V.forEach(([a, b, c, d], index) => {
        const [alpha, beta, gamma] = toABC(a, b, c, d);
        // Assuming the new gamma should be used as c in the transformed coordinates
        V[index] = [alpha, beta, gamma];
    });

    function constructible(element) {
        const gamma = element[2];
        return ((Math.log(gamma)/Math.log(2)) % 1 !== 0);
    }

    const Vcon = V.filter(constructible);

    if (Vcon.length > V.length/2){
        V = Vcon;
    }

    V.forEach((item, index) => {
        const [alpha, beta, gamma] = item;
        const additionalData = rankIt(alpha, beta, gamma);
        V[index] = [alpha, beta, gamma, ...additionalData]; // Update element with additional data
    });
    
    console.log(V)
    return V;
};

const sum_str = (a, b) => (
    ((b != 0) ? "(" : "") +
    ((a == 0) ? "" : a) +
    (((a != 0) && (b != 0)) ? ((b < 0) ? "-" : "+") : "") +
    ((b == 0) ? "" : ((Math.abs(b) == 1) ? "" : Math.abs(b)) + "√2") +
    ((a == 0) && (b == 0) ? "0" : "") +
    ((b != 0) ? ")" : "")
);

const coord_str = ([a, b, c, d]) => sum_str(a, b) + "/" + sum_str(c, d);

function gcd(a, b) {
    if (b) {
        return gcd(b, a % b);
    } else {
        return Math.abs(a);
    }
}

function rankIt(alpha, beta, gamma) {
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
        }
    }
    if (beta <= 0 && alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(-beta, gamma);
        const rank2 = searchForFraction(alpha + 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankB = rank1 + rank2;
        }
    }
    if (beta >= 0 && alpha - 2 * beta >= 0) {
        const rank1 = searchForFraction(2 * beta, gamma);
        const rank2 = searchForFraction(alpha - 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankC = rank1 + rank2;
        }
    }
    if (beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(beta, gamma);
        const rank2 = searchForFraction(alpha - beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankD = rank1 + rank2;
        }
    }
    if (alpha + beta >= 0 && alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(alpha + beta, gamma);
        const rank2 = searchForFraction(alpha + 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankE = rank1 + rank2;
        }
    }
    if (alpha + beta >= 0 && -alpha + 2 * beta >= 0) {
        const rank1 = searchForFraction(2 * alpha + 2 * beta, 3 * gamma);
        const rank2 = searchForFraction(-alpha + 2 * beta, 3 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankF = rank1 + rank2;
        }
    }
    if (alpha + beta >= 0 && -alpha + beta >= 0) {
        const rank1 = searchForFraction(alpha + beta, 2 * gamma);
        const rank2 = searchForFraction(-alpha + beta, 2 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankG = rank1 + rank2;
        }
    }
    if (alpha + 2 * beta >= 0 && alpha - 2 * beta >= 0) {
        const rank1 = searchForFraction(alpha + 2 * beta, 2 * gamma);
        const rank2 = searchForFraction(alpha - 2 * beta, 4 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankH = rank1 + rank2;
        }
    }
    if (alpha + 2 * beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(alpha + 2 * beta, 3 * gamma);
        const rank2 = searchForFraction(alpha - beta, 3 * gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankI = rank1 + rank2;
        }
    }
    if (-alpha + 2 * beta >= 0 && alpha - beta >= 0) {
        const rank1 = searchForFraction(-alpha + 2 * beta, gamma);
        const rank2 = searchForFraction(2 * alpha - 2 * beta, gamma);
        if (rank1 !== undefined && rank2 !== undefined) {
            rankJ = rank1 + rank2;
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


// Function to search for a specific numerator and denominator
function findRank(numerator, denominator) {
    // Check if the fraction is greater than one
    if (numerator > denominator) {
        // Swap numerator and denominator for fractions greater than 1
        [numerator, denominator] = [denominator, numerator];
    }
    //performs regular search
    let result = lookupTable.find(row => row.numerator === numerator && row.denominator === denominator);
    return result ? result.rank : null;  // Return the rank if found, otherwise return null
}

// Function you can call later to search after data is loaded
function searchForFraction(numerator, denominator) {
    let rank = findRank(numerator/gcd(numerator,denominator), denominator/gcd(numerator,denominator));
    if (rank !== null) {
        return rank;
    } else {
        return Infinity;
    }
}
