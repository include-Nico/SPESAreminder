// js/storico.js

// URL del tuo Google Apps Script
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

    let expenseChart = null; 
    let allData = []; 

    // Torna alla schermata principale
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Formattazione Euro
    const formatValuta = (val) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

    // --- NUOVO: DIZIONARIO VISIVO SUPERMERCATI ---
    function getBrandIcon(brandName) {
        const name = brandName.toLowerCase();
        if (name.includes('conad')) return '🟠';
        if (name.includes('coop')) return '🔴';
        if (name.includes('esselunga')) return '🟢';
        if (name.includes('eurospin')) return '🔵';
        if (name.includes('lidl')) return '🟡';
        if (name.includes('carrefour')) return '⚪';
        return '🛒'; // Default / Ignoto
    }

    // 1. SCARICA I DATI DAL CLOUD
    async function fetchStorico() {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const data = await response.json();
            allData = data;
            
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
        const meseCorrente = oggi.getMonth(); 
        const annoCorrente = oggi.getFullYear();

        let totaleMese = 0;
        const supermercatiSpesa = {}; 

        allData.forEach(item => {
            if (!item.data) return; // Evita righe vuote
            
            const [datePart] = item.data.split(','); 
            const [giorno, meseStr, anno] = datePart.trim().split('/');
            const mese = parseInt(meseStr) - 1; 
            const totale = parseFloat(item.totale) || 0;

            if (mese === meseCorrente && parseInt(anno) === annoCorrente) {
                totaleMese += totale;
            }

            // Separiamo il marchio dalle coordinate GPS (es. "Conad, GPS: 45.1, 9.4")
            const parts = (item.supermercato || "Ignoto").split(',');
            let brand = parts[0].trim();
            
            // Pulizia per vecchi salvataggi o GPS crudi
            if (brand.includes('Coordinate') || brand.includes('GPS') || brand.includes('ignota')) {
                brand = 'Ignoto'; 
            }

            if(!supermercatiSpesa[brand]) supermercatiSpesa[brand] = 0;
            supermercatiSpesa[brand] += totale;
        });

        const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        
        meseTotaleEl.textContent = formatValuta(totaleMese);
        meseNomeEl.textContent = nomiMesi[meseCorrente] + " " + annoCorrente;

        let maxSpesa = 0;
        let maxSup = "-";
        
        // Trova il supermercato in cui abbiamo speso di più (ignorando "Ignoto" se possibile)
        for (const [sup, spesa] of Object.entries(supermercatiSpesa)) {
            if (spesa > maxSpesa && sup !== 'Ignoto') {
                maxSpesa = spesa;
                maxSup = sup;
            }
        }
        
        // Se c'è solo roba ignota, usiamo quella
        if (maxSup === "-" && supermercatiSpesa['Ignoto']) {
            maxSup = 'Ignoto';
            maxSpesa = supermercatiSpesa['Ignoto'];
        }

        // Mostriamo il vincitore con la sua icona
        if (maxSup !== "-") {
            topSupermercatoEl.textContent = `${getBrandIcon(maxSup)} ${maxSup}`;
        } else {
            topSupermercatoEl.textContent = "-";
        }
        
        topSpesaEl.textContent = formatValuta(maxSpesa) + " totali";
    }

    // 3. DISEGNA LA LISTA DELLE ULTIME SPESE
    function renderListaSpese() {
        historyList.innerHTML = '';
        if (!allData || allData.length === 0) {
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center;">Nessuna spesa registrata. Fai la tua prima spesa!</li>';
            return;
        }

        // Ultima spesa fatta in cima
        const datiOrdinati = [...allData].reverse();

        datiOrdinati.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item glass-panel';

            const totale = parseFloat(item.totale) || 0;

            // Logica per formattare elegantemente Marchio + GPS
            const parts = (item.supermercato || "Ignoto").split(',');
            let brand = parts[0].trim();
            let gpsData = parts.length > 1 ? parts.slice(1).join(',').trim() : "";
            
            // Fix per vecchi inserimenti 
            if (brand.includes('Coordinate') || brand.includes('GPS') || brand.includes('ignota')) {
                gpsData = brand.includes('ignota') ? "" : brand;
                brand = "Ignoto";
            }

            const icon = getBrandIcon(brand);
            let locationHtml = `<div class="history-location" style="font-weight: 600; font-size: 1rem;">${icon} ${brand}</div>`;
            if (gpsData) {
                locationHtml += `<div style="font-size: 0.75rem; color: #777; margin-top: -5px; padding-left: 24px;">📍 ${gpsData}</div>`;
            }

            // Se c'è uno scontrino letto correttamente, mostra il box
            let scontrinoHtml = '';
            if (item.scontrino && item.scontrino !== "Nessuna foto" && item.scontrino !== "Errore Lettura") {
                scontrinoHtml = `<div class="history-receipt" style="margin-top: 5px;">📝 "${item.scontrino}"</div>`;
            }

            li.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${item.data}</span>
                    <span class="history-total">${formatValuta(totale)}</span>
                </div>
                ${locationHtml}
                ${scontrinoHtml}
            `;
            historyList.appendChild(li);
        });
    }

    // 4. DISEGNA IL GRAFICO
    function renderGrafico() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const mesiLabels = [];
        const datiSpesa = [];
        
        const oggi = new Date();
        // Calcola a ritroso per 6 mesi
        for (let i = 5; i >= 0; i--) {
            const d = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);
            const meseStr = d.toLocaleDateString('it-IT', { month: 'short' });
            mesiLabels.push(meseStr.charAt(0).toUpperCase() + meseStr.slice(1));
            
            let totale = 0;
            allData.forEach(item => {
                if (!item.data) return;
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

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesiLabels,
                datasets: [{
                    label: 'Spesa Mensile',
                    data: datiSpesa,
                    borderColor: '#4facfe', 
                    backgroundColor: 'rgba(79, 172, 254, 0.2)', 
                    borderWidth: 3,
                    pointBackgroundColor: '#00f2fe',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4 // Linea curva
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false } 
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' }, 
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

    // Aggiornamento grafico al cambio select
    chartPeriodSelect.addEventListener('change', () => {
        renderGrafico(); 
    });

    // Avvio Motore
    fetchStorico();
});