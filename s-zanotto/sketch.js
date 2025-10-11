let stats = {};
let validRows = [];

// caricare il csv
async function loadCSV() {
    try {
        const response = await fetch('data.csv');
        const csvText = await response.text();

         Papa.parse(csvText, { //papa.parse è una funzione per analizzare csv 
            header: true, // prima è l'intestazione
            dynamicTyping: true, // converte automaticamnte i numeri (da stringa)
            complete: function(results) {

           validRows = results.data.filter(row => { // results.data è array con tutte le righe del csv
                                                    // filter crea nuovo array con solo le righe che rispettano la condizione
                    const col3 = row.column3;
                    return col3 >= 30 && col3 < 42 && col3 % 3 === 0;
                });
                // arrow function verifica che per ogni riga 
                // - column3 eve essere almeno 30 (col3 >= 30)
                // - column3 deve essere minore di 42 (col3 < 42)
                // - column3 deve essere divisibile per 3 (col3 % 3 === 0)
                                console.log(`Valid rows: ${validRows.length} out of ${results.data.length}`);

                calculateStatistics();
                displayResults();
            }
        });
    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

// funzione per calcolare statistiche
function calculateStatistics() {
    const col0 = validRows.map(r => r.column0);
    const col1 = validRows.map(r => r.column1);
    const col2 = validRows.map(r => r.column2);
    const col3 = validRows.map(r => r.column3);
    const col4 = validRows.map(r => r.column4);

      stats = {
        meanCol0: mean(col0),
        stdCol1: standardDeviation(col1),
        modeCol2: mode(col2),
        medianCol3: median(col3),
        meanCol4: mean(col4),
        stdCol4: standardDeviation(col4),
        validRowCount: validRows.length
    };
}

// MEDIA
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// DEZIAZIONE STANDARD
function standardDeviation(arr) {
    const avg = mean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

// MODA
function mode(arr) {
    const frequency = {};
    let maxFreq = 0;
    let modeValue = arr[0];

    arr.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
        if (frequency[val] > maxFreq) {
            maxFreq = frequency[val];
            modeValue = val;
        }
    });

    return modeValue;
}

// MEDIANA
function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
}

// mostra i resultss
function displayResults() {
    // Display in list (Textual 1)
    const statsList = document.getElementById('statsList');
    statsList.innerHTML = `
        <li><span class="stat-label">Valid Rows:</span><span class="stat-value">${stats.validRowCount}</span></li>
        <li><span class="stat-label">Mean (Column 0):</span><span class="stat-value">${stats.meanCol0.toFixed(2)}</span></li>
        <li><span class="stat-label">Std Dev (Column 1):</span><span class="stat-value">${stats.stdCol1.toFixed(2)}</span></li>
        <li><span class="stat-label">Mode (Column 2):</span><span class="stat-value">${stats.modeCol2.toFixed(2)}</span></li>
        <li><span class="stat-label">Median (Column 3):</span><span class="stat-value">${stats.medianCol3.toFixed(2)}</span></li>
        <li><span class="stat-label">Mean (Column 4):</span><span class="stat-value">${stats.meanCol4.toFixed(2)}</span></li>
        <li><span class="stat-label">Std Dev (Column 4):</span><span class="stat-value">${stats.stdCol4.toFixed(2)}</span></li>
    `;

    // tabella 2
      const statsTable = document.getElementById('statsTable');
    statsTable.innerHTML = `
        <thead>
            <tr>
                <th>Column</th>
                <th>Statistic</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Column 0</td><td>Mean</td><td>${stats.meanCol0.toFixed(2)}</td></tr>
            <tr><td>Column 1</td><td>Standard Deviation</td><td>${stats.stdCol1.toFixed(2)}</td></tr>
            <tr><td>Column 2</td><td>Mode</td><td>${stats.modeCol2.toFixed(2)}</td></tr>
            <tr><td>Column 3</td><td>Median</td><td>${stats.medianCol3.toFixed(2)}</td></tr>
            <tr><td>Column 4</td><td>Mean</td><td>${stats.meanCol4.toFixed(2)}</td></tr>
            <tr><td>Column 4</td><td>Standard Deviation</td><td>${stats.stdCol4.toFixed(2)}</td></tr>
        </tbody>
    `;
}
window.addEventListener('DOMContentLoaded', loadCSV);
             
