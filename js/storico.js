// js/storico.js

// Sostituisci questo link con lo STESSO URL di Google Apps Script che hai messo in main.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQSvwCvMGNfY1NISEG04xW-Cr0HVwESXjpkX4mFoqvwXw-VyV_4-a8qIbdKN0cFS22/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Referenze degli elementi grafici
    const backBtn = document.getElementById('back-btn');
    const meseTotaleEl = document.getElementById('mese-totale');
    const meseNomeEl = document.getElementById('mese-nome');
    const topSupermercatoEl = document.getElementById('top-supermercato');
    const topSpesaEl = document.getElementById('top-spesa');
    const historyList = document.getElementById('history-list');
    const chartPeriodSelect = document.getElementById('chart-period');

    let expenseChart = null; // Conterrà il grafico Chart.js
    let allData = []; // Qui salveremo i dati scaricati dal cloud

    // Torna alla schermata principale
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Funzione comodità per formattare i numeri in Euro (es. 45.5 -> 45,50 €)
    const formatValuta = (val) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

    // 1. SCARICA I DATI DAL CLOUD
    async function fetchStorico() {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const data = await response.json();
            allData = data;
            
            // Appena ha scaricato i dati, avvia le 3 funzioni di disegno
            aggiornaDashboardNumeri();
            renderListaSpese();
            renderGrafico();
        } catch (error) {
            console.error("Errore nel caricamento dei dati:", error);
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center; color: #ff4757; font-weight:bold;">Errore di connessione al Cloud. Riprova più tardi.</li>';
            meseNomeEl.textContent = "Offline";
        }
    }

    // 2. CALCOLA I NUMERI DEI QUADRATI IN ALTO
    function aggiornaDashboardNumeri() {
        if (!allData || allData.length === 0) {
            meseNomeEl.textContent = "Nessun dato";
            return;
        }

        const oggi = new Date();
        const meseCorrente = oggi.getMonth(); // Da 0 a 11
        const annoCorrente = oggi.getFullYear();

        let totaleMese = 0;
        const supermercatiSpesa = {}; // Oggetto per capire dove si spende di più

        allData.forEach(item => {
            // Estrapola mese e anno dalla data salvata (formato DD/MM/YYYY)
            const [datePart] = item.data.split(','); 
            const [giorno, meseStr, anno] = datePart.trim().split('/');
            const mese = parseInt(meseStr) - 1; 
            const totale = parseFloat(item.totale) || 0;

            // Se la spesa è di questo mese e questo anno, sommala
            if (mese === meseCorrente && parseInt(anno) === annoCorrente) {
                totaleMese += totale;
            }

            // Calcolo del supermercato top (Prende solo la prima parte per aggregare meglio)
            const nomeSup = item.supermercato.split(',')[0].substring(0, 20); 
            if(!supermercatiSpesa[nomeSup]) supermercatiSpesa[nomeSup] = 0;
            supermercatiSpesa[nomeSup] += totale;
        });

        const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        
        // Aggiorna l'HTML
        meseTotaleEl.textContent = formatValuta(totaleMese);
        meseNomeEl.textContent = nomiMesi[meseCorrente] + " " + annoCorrente;

        // Trova chi ha vinto tra i supermercati
        let maxSpesa = 0;
        let maxSup = "-";
        for (const [sup, spesa] of Object.entries(supermercatiSpesa)) {
            if (spesa > maxSpesa) {
                maxSpesa = spesa;
                maxSup = sup;
            }
        }

        // Se è una coordinata GPS, lo abbrevia per bellezza
        topSupermercatoEl.textContent = maxSup.includes("Coordinate") ? "GPS 📍" : maxSup;
        topSpesaEl.textContent = formatValuta(maxSpesa) + " totali";
    }

    // 3. DISEGNA LA LISTA DELLE ULTIME SPESE
    function renderListaSpese() {
        historyList.innerHTML = '';
        if (!allData || allData.length === 0) {
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center;">Nessuna spesa registrata. Fai la tua prima spesa!</li>';
            return;
        }

        // Inverte l'array così l'ultima spesa fatta appare per prima in alto
        const datiOrdinati = [...allData].reverse();

        datiOrdinati.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item glass-panel';

            const totale = parseFloat(item.totale) || 0;

            li.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${item.data}</span>
                    <span class="history-total">${formatValuta(totale)}</span>
                </div>
                <div class="history-location">📍 ${item.supermercato}</div>
                <div class="history-receipt">📝 "${item.scontrino}"</div>
            `;
            historyList.appendChild(li);
        });
    }

    // 4. DISEGNA IL GRAFICO (CHART.JS)
    function renderGrafico() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const mesiLabels = [];
        const datiSpesa = [];
        
        // Calcoliamo gli ultimi 6 mesi partendo da oggi a ritroso
        const oggi = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);
            // Crea l'etichetta corta (es. "Gen", "Feb")
            const meseStr = d.toLocaleDateString('it-IT', { month: 'short' });
            mesiLabels.push(meseStr.charAt(0).toUpperCase() + meseStr.slice(1));
            
            let totale = 0;
            // Somma tutte le spese fatte in quel determinato mese
            allData.forEach(item => {
                const [datePart] = item.data.split(','); 
                const parts = datePart.trim().split('/');
                if (parts.length === 3) {
                    const m = parseInt(parts[1]) - 1;
                    const y = parseInt(parts[2]);
                    if (m === d.getMonth() && y === d.getFullYear()) {
                        totale += parseFloat(item.totale) || 0;
                    }
                }
            });
            datiSpesa.push(totale);
        }

        // Se c'è già un grafico, lo distrugge prima di ridisegnarlo (previene glitch grafici)
        if (expenseChart) {
            expenseChart.destroy();
        }

        // Genera il grafico!
        expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesiLabels,
                datasets: [{
                    label: 'Spesa Mensile',
                    data: datiSpesa,
                    borderColor: '#4facfe', // Azzurro neon
                    backgroundColor: 'rgba(79, 172, 254, 0.2)', // Azzurro trasparente sotto
                    borderWidth: 3,
                    pointBackgroundColor: '#00f2fe',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4 // Rende la linea morbidamente curva
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false } // Nasconde la legenda inutile
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' }, // Griglia leggerissima
                        ticks: { color: '#555' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#555', font: { weight: 'bold' } }
                    }
                }
            }
        });
    }

    // Se l'utente cambia tra "Mensile" e "Annuale"
    chartPeriodSelect.addEventListener('change', () => {
        // (Per ora ricarica lo stesso grafico a 6 mesi, ma è pronto per essere espanso in futuro!)
        renderGrafico(); 
    });

    // Avvio Motore
    fetchStorico();
});