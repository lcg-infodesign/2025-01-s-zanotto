// ===== DATI CSV =====
const csvData = `column0,column1,column2,column3,column4
-5,-18,98,36,-43
-6,30,7,-42,26
3,61,-30,36,56
-16,-45,31,30,-12
-20,41,-82,36,-58
60,-39,11,30,-7
-5,45,-18,30,-33
71,37,-37,30,-61
-24,55,35,30,-82
69,94,13,39,66
62,-55,-77,39,-57
57,69,40,9,-44
-39,63,13,39,-37
11,63,39,-42,-23`;

// ===== VARIABILI GLOBALI =====
let validRows = []; // array che contiene le righe valide
let displayedRows = []; // array che conterrà le righe visualizzate (dopo filtri)
let stats = {}; // oggetto che conterrà le statistiche calcolate
let sortColumn = null; // colonna attualmente ordinata
let sortDirection = 'asc'; // direzione ordinamento (asc o desc)
let currentFilter = 'all'; // filtro attualmente applicato
let highlightType = null; // tipo di evidenziazione attiva (mean, mode, null)

// ===== FUNZIONE PRINCIPALE =====
// questa funzione viene eseguita quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    // 1. parse del CSV e filtro delle righe valide
    parseAndFilterCSV();
    
    // 2. calcolo delle statistiche
    calculateStatistics();
    
    // 3. aggiornamento dell'interfaccia
    updateUI();
    
    // 4. creazione dei grafici
    createCharts();
    
    // 5. riempimento delle tabelle
    populateTables();
});

// ===== PARSE E FILTRO DEL CSV =====
function parseAndFilterCSV() {
    // divide il CSV in righe
    const lines = csvData.trim().split('\n');
    
    // salta la prima riga (header) e processiamo le altre
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => parseFloat(v.trim()));
        
        const row = {
            column0: values[0],
            column1: values[1],
            column2: values[2],
            column3: values[3],
            column4: values[4]
        };
        
        // controlliamo se la riga è valida secondo le regole
        // regola 1: column3 deve essere un intero tra 30 (incluso) e 42 (escluso)
        // regola 2: column3 deve essere multiplo di 3
        const col3 = row.column3;
        const isInteger = Number.isInteger(col3);
        const inRange = col3 >= 30 && col3 < 42;
        const isMultipleOf3 = col3 % 3 === 0;
        
        // se entrambe le regole sono soddisfatte, aggiungiamo la riga
        if (isInteger && inRange && isMultipleOf3) {
            validRows.push(row);
        }
    }
    
    // inizialmente, le righe visualizzate sono tutte quelle valide
    displayedRows = [...validRows];
}

// ===== CALCOLO DELLE STATISTICHE =====
function calculateStatistics() {
    // estraiamo i valori di ogni colonna
    const col0Values = validRows.map(r => r.column0);
    const col1Values = validRows.map(r => r.column1);
    const col2Values = validRows.map(r => r.column2);
    const col3Values = validRows.map(r => r.column3);
    const col4Values = validRows.map(r => r.column4);
    
    // calcoliamo le statistiche richieste
    stats = {
        meanCol0: mean(col0Values),           // media di colonna 0
        stdDevCol1: stdDev(col1Values),       // deviazione standard di colonna 1
        modeCol2: mode(col2Values),           // moda di colonna 2
        medianCol3: median(col3Values),       // mediana di colonna 3
        meanCol4: mean(col4Values),           // media di colonna 4
        stdDevCol4: stdDev(col4Values),       // deviazione standard di colonna 4
        validCount: validRows.length          // numero di righe valide
    };
}

// ===== FUNZIONI STATISTICHE =====

// calcola la media di un array
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// calcola la deviazione standard di un array
function stdDev(arr) {
    const avg = mean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
}

// calcola la moda (valore più frequente) di un array
function mode(arr) {
    const freq = {};
    arr.forEach(value => {
        freq[value] = (freq[value] || 0) + 1;
    });
    
    let maxFreq = 0;
    let modeVal = arr[0];
    
    for (let key in freq) {
        if (freq[key] > maxFreq) {
            maxFreq = freq[key];
            modeVal = parseFloat(key);
        }
    }
    
    return modeVal;
}

// calcola la mediana di un array
function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    // se la lunghezza è pari, la mediana è la media dei due valori centrali
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    // se la lunghezza è dispari, la mediana è il valore centrale
    return sorted[mid];
}

// ===== AGGIORNAMENTO INTERFACCIA =====
function updateUI() {
    // aggiorniamo il conteggio delle righe valide
    document.getElementById('validCount').textContent = stats.validCount;
    
    // aggiorniamo le statistiche nelle card
    document.getElementById('meanCol0').textContent = stats.meanCol0.toFixed(2);
    document.getElementById('stdDevCol1').textContent = stats.stdDevCol1.toFixed(2);
    document.getElementById('modeCol2').textContent = stats.modeCol2.toFixed(2);
    document.getElementById('medianCol3').textContent = stats.medianCol3.toFixed(2);
    document.getElementById('meanCol4').textContent = stats.meanCol4.toFixed(2);
    document.getElementById('stdDevCol4').textContent = stats.stdDevCol4.toFixed(2);
}

// ===== CREAZIONE GRAFICI =====
let barChart = null;
let pieChart = null;

function createCharts() {
    // colori pastello per i grafici
    const colors = ['#B8A7D6', '#F0C4D5', '#FFEAB3', '#FFD4B8', '#C5B8E0'];
    
    // GRAFICO A BARRE
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Mean Col0', 'StdDev Col1', 'Mode Col2', 'Median Col3', 'Mean Col4'],
            datasets: [{
                label: 'Valore',
                data: [
                    stats.meanCol0.toFixed(2),
                    stats.stdDevCol1.toFixed(2),
                    stats.modeCol2.toFixed(2),
                    stats.medianCol3.toFixed(2),
                    stats.meanCol4.toFixed(2)
                ],
                backgroundColor: colors,
                borderColor: colors.map(c => c),
                borderWidth: 2,
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: '#8B7EA8',
                    bodyColor: '#8B7EA8',
                    borderColor: '#B8A7D6',
                    borderWidth: 3,
                    titleFont: {
                        family: 'Press Start 2P',
                        size: 10
                    },
                    bodyFont: {
                        family: 'Press Start 2P',
                        size: 10
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Press Start 2P',
                            size: 10
                        },
                        color: '#8B7EA8'
                    },
                    grid: {
                        color: 'rgba(139, 126, 168, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Press Start 2P',
                            size: 8
                        },
                        color: '#8B7EA8',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // GRAFICO A TORTA
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Mean Col0', 'Mode Col2', 'Median Col3'],
            datasets: [{
                data: [
                    Math.abs(stats.meanCol0),
                    Math.abs(stats.modeCol2),
                    Math.abs(stats.medianCol3)
                ],
                backgroundColor: [colors[0], colors[2], colors[3]],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Press Start 2P',
                            size: 10
                        },
                        color: '#8B7EA8',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: '#8B7EA8',
                    bodyColor: '#8B7EA8',
                    borderColor: '#B8A7D6',
                    borderWidth: 3,
                    titleFont: {
                        family: 'Press Start 2P',
                        size: 10
                    },
                    bodyFont: {
                        family: 'Press Start 2P',
                        size: 10
                    }
                }
            }
        }
    });
}

// ===== POPOLAMENTO TABELLE =====
function populateTables() {
    // tabella delle righe valide (statica)
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    validRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.column0}</td>
            <td>${row.column1}</td>
            <td>${row.column2}</td>
            <td>${row.column3}</td>
            <td>${row.column4}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    // tabella del data explorer (dinamica)
    updateExplorerTable();
}

// ===== DATA EXPLORER - AGGIORNAMENTO TABELLA =====
function updateExplorerTable() {
    const explorerTableBody = document.getElementById('explorerTableBody');
    explorerTableBody.innerHTML = '';
    
    // aggiorniamo i contatori
    document.getElementById('displayedCount').textContent = displayedRows.length;
    document.getElementById('totalCount').textContent = validRows.length;
    
    // riempiamo la tabella con le righe visualizzate
    displayedRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        
        // controlliamo se la riga deve essere evidenziata
        if (highlightType === 'mean' && Math.abs(row.column0 - stats.meanCol0) < 10) {
            tr.classList.add('highlight-mean');
        } else if (highlightType === 'mode' && row.column2 === stats.modeCol2) {
            tr.classList.add('highlight-mode');
        }
        
        tr.innerHTML = `
            <td class="${sortColumn === 'column0' ? 'sorted-column' : ''}">${row.column0}</td>
            <td class="${sortColumn === 'column1' ? 'sorted-column' : ''}">${row.column1}</td>
            <td class="${sortColumn === 'column2' ? 'sorted-column' : ''}">${row.column2}</td>
            <td>${row.column3}</td>
            <td class="${sortColumn === 'column4' ? 'sorted-column' : ''}">${row.column4}</td>
        `;
        explorerTableBody.appendChild(tr);
    });
    
    // aggiorniamo gli header della tabella per mostrare quale colonna è ordinata
    updateTableHeaders();
    
    // mostriamo quante righe sono evidenziate
    if (highlightType) {
        const highlightedCount = displayedRows.filter(row => {
            if (highlightType === 'mean') {
                return Math.abs(row.column0 - stats.meanCol0) < 10;
            } else if (highlightType === 'mode') {
                return row.column2 === stats.modeCol2;
            }
            return false;
        }).length;
        
        document.getElementById('highlightedInfo').textContent = 
            `| EVIDENZIATE: ${highlightedCount}`;
    } else {
        document.getElementById('highlightedInfo').textContent = '';
    }
}

// ===== DATA EXPLORER - AGGIORNAMENTO HEADER TABELLA =====
function updateTableHeaders() {
    const headers = document.querySelectorAll('#explorerTable th');
    headers.forEach((header, idx) => {
        header.classList.remove('sorted');
        
        // aggiungiamo la classe 'sorted' all'header della colonna ordinata
        const columnName = ['column0', 'column1', 'column2', 'column3', 'column4'][idx];
        if (sortColumn === columnName) {
            header.classList.add('sorted');
            
            // aggiungiamo la freccia di ordinamento
            const arrow = sortDirection === 'asc' ? ' ↑' : ' ↓';
            if (!header.textContent.includes('↑') && !header.textContent.includes('↓')) {
                header.textContent += arrow;
            }
        } else {
            // rimuoviamo le frecce dagli altri header
            header.textContent = header.textContent.replace(' ↑', '').replace(' ↓', '');
        }
    });
}

// ===== DATA EXPLORER - ORDINAMENTO =====
function sortData(column) {
    // se clicchiamo sulla stessa colonna, invertiamo la direzione
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // ordiniamo le righe visualizzate
    displayedRows.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // aggiorniamo i bottoni
    updateSortButtons();
    
    // aggiorniamo la tabella
    updateExplorerTable();
}

// ===== DATA EXPLORER - RESET ORDINAMENTO =====
function resetSort() {
    sortColumn = null;
    sortDirection = 'asc';
    
    // ricalcoliamo le righe visualizzate applicando il filtro corrente
    applyCurrentFilter();
    
    // aggiorniamo i bottoni
    updateSortButtons();
    
    // aggiorniamo la tabella
    updateExplorerTable();
}

// ===== DATA EXPLORER - AGGIORNAMENTO BOTTONI ORDINAMENTO =====
function updateSortButtons() {
    const sortButtons = document.querySelectorAll('.control-section:first-child .control-btn');
    sortButtons.forEach((btn, idx) => {
        btn.classList.remove('active');
        
        // rimuoviamo le frecce dal testo del bottone
        btn.textContent = btn.textContent.replace(' ↑', '').replace(' ↓', '');
        
        if (idx < 5) { // i primi 5 bottoni sono per le colonne
            const columnName = ['column0', 'column1', 'column2', 'column3', 'column4'][idx];
            if (sortColumn === columnName) {
                btn.classList.add('active');
                const arrow = sortDirection === 'asc' ? ' ↑' : ' ↓';
                btn.textContent = `COL ${idx}${arrow}`;
            } else {
                btn.textContent = `COL ${idx}`;
            }
        }
    });
}

// ===== DATA EXPLORER - FILTRI =====
function filterData(filterType) {
    currentFilter = filterType;
    applyCurrentFilter();
    
    // aggiorniamo i bottoni
    updateFilterButtons();
    
    // aggiorniamo la tabella
    updateExplorerTable();
}

// ===== DATA EXPLORER - APPLICAZIONE FILTRO CORRENTE =====
function applyCurrentFilter() {
    if (currentFilter === 'all') {
        displayedRows = [...validRows];
    } else if (currentFilter === 'col0-positive') {
        displayedRows = validRows.filter(r => r.column0 > 0);
    } else if (currentFilter === 'col0-negative') {
        displayedRows = validRows.filter(r => r.column0 < 0);
    } else if (currentFilter === 'col4-positive') {
        displayedRows = validRows.filter(r => r.column4 > 0);
    } else if (currentFilter === 'col4-negative') {
        displayedRows = validRows.filter(r => r.column4 < 0);
    }
    
    // se c'è un ordinamento attivo, lo riapplichiamo
    if (sortColumn) {
        displayedRows.sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }
}

// ===== DATA EXPLORER - AGGIORNAMENTO BOTTONI FILTRO =====
function updateFilterButtons() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // attiviamo il bottone del filtro corrente
    const filterMap = {
        'all': 0,
        'col0-positive': 1,
        'col0-negative': 2,
        'col4-positive': 3,
        'col4-negative': 4
    };
    
    if (filterMap[currentFilter] !== undefined) {
        filterButtons[filterMap[currentFilter]].classList.add('active');
    }
}

// ===== DATA EXPLORER - EVIDENZIAZIONE =====
function highlightMean() {
    highlightType = highlightType === 'mean' ? null : 'mean';
    updateHighlightButtons();
    updateExplorerTable();
}

function highlightMode() {
    highlightType = highlightType === 'mode' ? null : 'mode';
    updateHighlightButtons();
    updateExplorerTable();
}

function removeHighlight() {
    highlightType = null;
    updateHighlightButtons();
    updateExplorerTable();
}

// ===== DATA EXPLORER - AGGIORNAMENTO BOTTONI EVIDENZIAZIONE =====
function updateHighlightButtons() {
    const meanBtn = document.querySelector('.btn-highlight-mean');
    const modeBtn = document.querySelector('.btn-highlight-mode');
    
    meanBtn.classList.remove('active');
    modeBtn.classList.remove('active');
    
    if (highlightType === 'mean') {
        meanBtn.classList.add('active');
    } else if (highlightType === 'mode') {
        modeBtn.classList.add('active');
    }
}