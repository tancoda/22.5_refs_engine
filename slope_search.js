//input a,b,c,d a la jason's program, convert this to a,b,c format

function convertABC (a,b,c,d){
    let info = [alpha, beta, gamma]
    if(c^2 > 2*d^2){
        alpha = a*c - 2*b*d;
        beta = b*c - a*d;
        gamma = c^2 - 2*d^2 
    } else {
        alpha = 2*b*d - a*c;
        beta = a*d - b*c;
        gamma = 2*d^2 - c^2
    }
    return info
}

// here we have a series of functions which go from a,b,c to a series of ten? pairs of slopes to establish it
// we also use double/quadruple, and bisector to generate three alternatives for each option, and also search their ten slope pairs

let data = [];
let dataLoadedPromise;  // This will store the promise

// Function to load data and return a promise
function loadData() {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            // Node.js environment
            const fs = require('fs');
            fs.readFile('slope_library.json', 'utf8', (err, jsonData) => {
                if (err) {
                    reject('Error reading the JSON file: ' + err);
                } else {
                    data = JSON.parse(jsonData);
                    resolve();  // Resolve the promise when data is loaded
                }
            });
        } else {
            // Browser environment
            fetch('slope_library.json')
                .then(response => response.json())
                .then(jsonData => {
                    data = jsonData;
                    resolve();  // Resolve the promise when data is loaded
                })
                .catch(error => reject('Error fetching the JSON file: ' + error));
        }
    });
}

// Initialize data loading and store the promise
dataLoadedPromise = loadData();

// Function to search for a specific numerator and denominator
function findRank(numerator, denominator) {
    // Check if the fraction is greater than one
    if (numerator > denominator) {
        // Swap numerator and denominator for fractions greater than 1
        [numerator, denominator] = [denominator, numerator];
    }
    //performs regular search
    let result = data.find(row => row.numerator === numerator && row.denominator === denominator);
    return result ? result.rank : null;  // Return the rank if found, otherwise return null
}

// Function you can call later to search after data is loaded
function searchForFraction(numerator, denominator) {
    // Ensure the data is loaded before searching
    dataLoadedPromise.then(() => {
        let rank = findRank(numerator, denominator);
        if (rank !== null) {
            console.log(`Rank for ${numerator}/${denominator}:`, rank);
        } else {
            console.log(`Fraction ${numerator}/${denominator} not found.`);
        }
    }).catch(error => console.error('Error during search:', error));
}

// Example usage:
// This can be called later after data has been loaded
searchForFraction(13, 25);  // Call this anytime after the script has run
searchForFraction(18,5);    // Call with different parameters as needed
