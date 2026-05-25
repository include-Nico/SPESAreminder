// js/storico.js

// Il tuo URL Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQSvwCvMGNfY1NISEG04xW-Cr0HVwESXjpkX4mFoqvwXw-VyV_4-a8qIbdKN0cFS22/exec';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTI BASE ---
    const backBtn = document.getElementById('back-btn');
    const meseTotaleEl = document.getElementById('mese-totale');
    const meseNomeEl = document.getElementById('mese-nome');
    const topSupermercatoEl = document.getElementById('top-supermercato');
    const topSpesaEl = document.getElementById('top-spesa');
    const historyList = document.getElementById('history-list');
    const chartPeriodSelect = document.getElementById('chart-period');

    // --- ELEMENTI FILTRI E MODALE ---
    const filterText = document.getElementById('filter-text');
    const sortOrder = document.getElementById('sort-order');
    const detailModal = document.getElementById('detail-modal');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    const detailClose = document.getElementById('detail-close');
    const detailDelete = document.getElementById('detail-delete');

    let expenseChart = null; 
    let allData = []; 

    backBtn.addEventListener('click', () => window.location.href = 'index.html');

    const formatValuta = (val) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

    // Dizionario Visivo
    function getBrandIcon(brandName) {
        const name = brandName.toLowerCase();
        if (name.includes('conad')) return '🟠';
        if (name.includes('coop')) return '🔴';
        if (name.includes('esselunga')) return '🟢';
        if (name.includes('eurospin')) return '🔵';
        if (name.includes('lidl')) return '🟡';
        if (name.includes('carrefour')) return '⚪';
        return '🛒'; 
    }

    // 1. SCARICA I DATI DAL CLOUD
    async function fetchStorico() {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const data = await response.json();
            allData = data;
            
            aggiornaDashboardNumeri();
            renderGrafico();
            renderListaSpese(); // Renderizza con i filtri
        } catch (error) {
            console.error("Errore nel caricamento dei dati:", error);
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center; color: #ff4757; font-weight:bold;">Errore di connessione al Cloud. Riprova più tardi.</li>';
            meseNomeEl.textContent = "Offline";
        }
    }

    // 2. CALCOLA DASHBOARD IN ALTO
    function aggiornaDashboardNumeri() {
        if (!allData || allData.length === 0) return;

        const oggi = new Date();
        const meseCorrente = oggi.getMonth(); 
        const annoCorrente = oggi.getFullYear();

        let totaleMese = 0;
        const supermercatiSpesa = {}; 

        allData.forEach(item => {
            if (!item.data) return; 
            const [datePart] = item.data.split(','); 
            const [giorno, meseStr, anno] = datePart.trim().split('/');
            const mese = parseInt(meseStr) - 1; 
            const totale = parseFloat(item.totale) || 0;

            if (mese === meseCorrente && parseInt(anno) === annoCorrente) totaleMese += totale;

            const parts = (item.supermercato || "Ignoto").split(',');
            let brand = parts[0].trim();
            
            if (brand.includes('Coordinate') || brand.includes('GPS') || brand.includes('ignota')) brand = 'Ignoto'; 
            if (!supermercatiSpesa[brand]) supermercatiSpesa[brand] = 0;
            supermercatiSpesa[brand] += totale;
        });

        const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        
        meseTotaleEl.textContent = formatValuta(totaleMese);
        meseNomeEl.textContent = nomiMesi[meseCorrente] + " " + annoCorrente;

        let maxSpesa = 0;
        let maxSup = "-";
        
        for (const [sup, spesa] of Object.entries(supermercatiSpesa)) {
            if (spesa > maxSpesa && sup !== 'Ignoto') { maxSpesa = spesa; maxSup = sup; }
        }
        if (maxSup === "-" && supermercatiSpesa['Ignoto']) { maxSup = 'Ignoto'; maxSpesa = supermercatiSpesa['Ignoto']; }

        topSupermercatoEl.textContent = maxSup !== "-" ? `${getBrandIcon(maxSup)} ${maxSup}` : "-";
        topSpesaEl.textContent = formatValuta(maxSpesa) + " totali";
    }

    // 3. GRAFICO CHART.JS
    function renderGrafico() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const mesiLabels = [];
        const datiSpesa = [];
        
        const oggi = new Date();
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
                    if (m === d.getMonth() && y === d.getFullYear()) totale += parseFloat(item.totale) || 0;
                }
            });
            datiSpesa.push(totale);
        }

        if (expenseChart) expenseChart.destroy();

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
                    tension: 0.4
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#555' } }, x: { grid: { display: false }, ticks: { color: '#555', font: { weight: 'bold' } } } } }
        });
    }

    // 4. LISTA CON FILTRI E ORDINAMENTO
    function renderListaSpese() {
        historyList.innerHTML = '';
        if (!allData || allData.length === 0) return;

        // Cloniamo l'array originale per non perderlo
        let filtered = [...allData];

        // A. Applica Filtro Ricerca
        const term = filterText.value.toLowerCase();
        if (term !== '') {
            filtered = filtered.filter(item => (item.supermercato || "").toLowerCase().includes(term));
        }

        // B. Applica Ordinamento
        if (sortOrder.value === 'recenti') {
            filtered.reverse(); // Array originale è cronologico
        } else if (sortOrder.value === 'prezzo-alto') {
            filtered.sort((a, b) => (parseFloat(b.totale) || 0) - (parseFloat(a.totale) || 0));
        } else if (sortOrder.value === 'prezzo-basso') {
            filtered.sort((a, b) => (parseFloat(a.totale) || 0) - (parseFloat(b.totale) || 0));
        }

        if (filtered.length === 0) {
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center;">Nessun risultato trovato.</li>';
            return;
        }

        filtered.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-item glass-panel';
            li.style.cursor = 'pointer'; // Rende chiaro che si può cliccare

            const totale = parseFloat(item.totale) || 0;
            const parts = (item.supermercato || "Ignoto").split(',');
            let brand = parts[0].trim();
            let gpsData = parts.length > 1 ? parts.slice(1).join(',').trim() : "";
            
            if (brand.includes('Coordinate') || brand.includes('GPS') || brand.includes('ignota')) {
                gpsData = brand.includes('ignota') ? "" : brand;
                brand = "Ignoto";
            }

            const icon = getBrandIcon(brand);
            let locationHtml = `<div class="history-location" style="font-weight: 600; font-size: 1rem;">${icon} ${brand}</div>`;
            if (gpsData) locationHtml += `<div style="font-size: 0.75rem; color: #777; margin-top: -5px; padding-left: 24px;">📍 ${gpsData}</div>`;

            li.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${item.data}</span>
                    <span class="history-total">${formatValuta(totale)}</span>
                </div>
                ${locationHtml}
                <div style="font-size: 0.75rem; color: #4facfe; margin-top: 8px; font-weight: bold;">👉 TOCCA PER I DETTAGLI</div>
            `;
            
            // Evento Click apre il Modale Dettaglio
            li.addEventListener('click', () => mostraDettaglio(item, brand, icon, gpsData));
            historyList.appendChild(li);
        });
    }

    // 5. GESTIONE MODALE DETTAGLIO
    function mostraDettaglio(item, brand, icon, gps) {
        detailTitle.textContent = `Spesa del ${item.data}`;
        
        let scontrinoHTML = `<div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4facfe;">
                                <strong style="color: #4facfe; font-size: 0.9rem;">📝 Testo Scontrino (OCR):</strong><br>
                                <span style="font-family: monospace; font-size: 0.85rem; color: #666;">Nessuna lettura scontrino effettuata.</span>
                             </div>`;
                             
        if (item.scontrino && item.scontrino !== "Nessuna foto" && item.scontrino !== "Errore Lettura") {
            scontrinoHTML = `<div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4facfe;">
                                <strong style="color: #4facfe; font-size: 0.9rem;">📝 Testo Scontrino (OCR):</strong><br>
                                <span style="font-family: monospace; font-size: 0.85rem; color: #444; word-wrap: break-word; line-height: 1.4;">${item.scontrino}</span>
                             </div>`;
        }

        detailContent.innerHTML = `
            <div style="font-size: 1.1rem; margin-bottom: 5px;"><strong>Supermercato:</strong> ${icon} ${brand}</div>
            ${gps ? `<div style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">📍 Posizione GPS: ${gps}</div>` : `<div style="margin-bottom: 15px;"></div>`}
            <div style="font-size: 1.4rem; color: #1a202c; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 10px; display: inline-block;"><strong>Totale Pagato:</strong> <span style="color: #2ecc71;">${formatValuta(item.totale)}</span></div>
            ${scontrinoHTML}
        `;
        
        detailModal.classList.remove('hidden');
        setTimeout(() => detailModal.classList.add('visible'), 10);

        // Eliminazione (Avviso)
        detailDelete.onclick = () => {
            if(confirm("Sei sicura di voler eliminare questa spesa dallo storico?")) {
                alert("Funzione di eliminazione in arrivo! Bisognerà aggiungere una riga di codice nel tuo Google Apps Script.");
                detailModal.classList.remove('visible');
                setTimeout(() => detailModal.classList.add('hidden'), 300);
            }
        };
    }

    detailClose.addEventListener('click', () => {
        detailModal.classList.remove('visible');
        setTimeout(() => detailModal.classList.add('hidden'), 300);
    });

    // Filtri dinamici "in tempo reale"
    filterText.addEventListener('input', renderListaSpese);
    sortOrder.addEventListener('change', renderListaSpese);
    if(chartPeriodSelect) chartPeriodSelect.addEventListener('change', renderGrafico);

    // Partenza
    fetchStorico();
});