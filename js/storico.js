// js/storico.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiCBpVCsyXBiTh-B-4tdfQmDPWVFg2J5f860gL5ogiXGHyURpnoKPuHVMB-SGmYxbE/exec';

document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    const meseTotaleEl = document.getElementById('mese-totale');
    const meseNomeEl = document.getElementById('mese-nome');
    const topSupermercatoEl = document.getElementById('top-supermercato');
    const topSpesaEl = document.getElementById('top-spesa');
    const historyList = document.getElementById('history-list');
    
    const filterText = document.getElementById('filter-text');
    const sortOrder = document.getElementById('sort-order');
    const detailModal = document.getElementById('detail-modal');
    const detailContent = document.getElementById('detail-content');
    const detailTitle = document.getElementById('detail-title');
    const detailClose = document.getElementById('detail-close');
    const detailDelete = document.getElementById('detail-delete');

    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    let expenseChart = null; 
    let allData = []; 

    backBtn.addEventListener('click', () => window.location.href = 'index.html');
    const formatValuta = (val) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

    // Nuovo sistema di Icone HTML
    function getBrandIconHTML(brandName) {
        const name = brandName.toLowerCase();
        if (name.includes('conad')) return '<div class="brand-logo brand-conad small-logo">C</div>';
        if (name.includes('coop')) return '<div class="brand-logo brand-coop small-logo" style="font-size:0.65rem;">coop</div>';
        if (name.includes('esselunga')) return '<div class="brand-logo brand-esselunga small-logo">E</div>';
        if (name.includes('eurospin')) return '<div class="brand-logo brand-eurospin small-logo">E</div>';
        if (name.includes('lidl')) return '<div class="brand-logo brand-lidl small-logo">L</div>';
        if (name.includes('carrefour')) return '<div class="brand-logo brand-carrefour small-logo">C</div>';
        return '<div class="brand-logo brand-ignoto small-logo">?</div>';
    }

    function mostraModale(titolo, messaggio, onConfirm) {
        modalTitle.textContent = titolo;
        modalMessage.textContent = messaggio;

        const oldCancelBtn = document.getElementById('modal-cancel');
        const oldConfirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = oldCancelBtn.cloneNode(true);
        const confirmBtn = oldConfirmBtn.cloneNode(true);
        oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);
        oldConfirmBtn.parentNode.replaceChild(confirmBtn, oldConfirmBtn);

        modalOverlay.classList.remove('hidden');
        setTimeout(() => modalOverlay.classList.add('visible'), 10);

        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('visible');
            setTimeout(() => modalOverlay.classList.add('hidden'), 300);
        });

        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            modalOverlay.classList.remove('visible');
            setTimeout(() => modalOverlay.classList.add('hidden'), 300);
        });
    }

    async function fetchStorico() {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            allData = await response.json();
            aggiornaDashboardNumeri();
            renderGrafico();
            renderListaSpese();
        } catch (error) {
            historyList.innerHTML = '<li class="history-item glass-panel" style="text-align:center; color: #ff4757;">Errore di connessione.</li>';
        }
    }

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

            let brand = item.supermercato.trim();
            if (!supermercatiSpesa[brand]) supermercatiSpesa[brand] = 0;
            supermercatiSpesa[brand] += totale;
        });

        const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        meseTotaleEl.textContent = formatValuta(totaleMese);
        meseNomeEl.textContent = nomiMesi[meseCorrente] + " " + annoCorrente;

        let maxSpesa = 0, maxSup = "-";
        for (const [sup, spesa] of Object.entries(supermercatiSpesa)) {
            if (spesa > maxSpesa && sup !== 'Ignoto') { maxSpesa = spesa; maxSup = sup; }
        }
        if (maxSup === "-" && supermercatiSpesa['Ignoto']) { maxSup = 'Ignoto'; maxSpesa = supermercatiSpesa['Ignoto']; }

        topSupermercatoEl.innerHTML = maxSup !== "-" ? `<div style="display:flex; align-items:center; justify-content:center; gap:8px;">${getBrandIconHTML(maxSup)} <span>${maxSup}</span></div>` : "-";
        topSpesaEl.textContent = formatValuta(maxSpesa) + " totali";
    }

    function renderGrafico() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const mesiLabels = [], datiSpesa = [];
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
                    const m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
                    if (m === d.getMonth() && y === d.getFullYear()) totale += parseFloat(item.totale) || 0;
                }
            });
            datiSpesa.push(totale);
        }

        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(ctx, {
            type: 'line',
            data: { labels: mesiLabels, datasets: [{ data: datiSpesa, borderColor: '#4facfe', backgroundColor: 'rgba(79, 172, 254, 0.2)', borderWidth: 3, fill: true, tension: 0.4 }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#555' } }, x: { grid: { display: false }, ticks: { color: '#555', font: { weight: 'bold' } } } } }
        });
    }

    function renderListaSpese() {
        historyList.innerHTML = '';
        if (!allData || allData.length === 0) return;

        let filtered = [...allData];
        const term = filterText.value.toLowerCase();
        if (term !== '') filtered = filtered.filter(item => (item.supermercato || "").toLowerCase().includes(term));

        if (sortOrder.value === 'recenti') filtered.reverse(); 
        else if (sortOrder.value === 'prezzo-alto') filtered.sort((a, b) => (parseFloat(b.totale) || 0) - (parseFloat(a.totale) || 0));
        else if (sortOrder.value === 'prezzo-basso') filtered.sort((a, b) => (parseFloat(a.totale) || 0) - (parseFloat(b.totale) || 0));

        filtered.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'history-item glass-panel';
            li.style.cursor = 'pointer'; 

            const totale = parseFloat(item.totale) || 0;
            let brand = item.supermercato.trim();
            const iconHTML = getBrandIconHTML(brand);

            li.innerHTML = `
                <div class="history-header"><span class="history-date">${item.data}</span><span class="history-total">${formatValuta(totale)}</span></div>
                <div class="history-location" style="font-weight: 600;">${iconHTML} <span>${brand}</span></div>
                <div style="font-size: 0.75rem; color: #4facfe; margin-top: 8px; font-weight: bold;">👉 TOCCA PER I DETTAGLI</div>
            `;
            li.addEventListener('click', () => mostraDettaglio(item, brand, iconHTML));
            historyList.appendChild(li);
        });
    }

    function mostraDettaglio(item, brand, iconHTML) {
        detailTitle.textContent = `Spesa del ${item.data}`;
        
        let articoliHTML = '';
        if (item.articoli && item.articoli !== "Nessun articolo") {
            const listaProdotti = item.articoli.split(',').map(prod => `• ${prod.trim()}`).join('<br>');
            articoliHTML = `<div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4facfe;">
                                <strong style="color: #4facfe; font-size: 0.9rem;">🛒 Articoli Acquistati:</strong><br>
                                <span style="font-size: 0.85rem; color: #444; line-height: 1.6;">${listaProdotti}</span>
                             </div>`;
        }

        detailContent.innerHTML = `
            <div style="font-size: 1.1rem; margin-bottom: 15px; display:flex; align-items:center; gap:8px;"><strong>Supermercato:</strong> ${iconHTML} <span>${brand}</span></div>
            <div style="font-size: 1.4rem; color: #1a202c; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 10px; display: inline-block;"><strong>Totale:</strong> <span style="color: #2ecc71;">${formatValuta(item.totale)}</span></div>
            ${articoliHTML}
        `;
        
        detailModal.classList.remove('hidden');
        setTimeout(() => detailModal.classList.add('visible'), 10);

        detailDelete.onclick = () => {
            mostraModale("Elimina Spesa", "Sei sicura di voler eliminare questa spesa dallo storico in modo permanente?", async () => {
                
                detailDelete.textContent = "Eliminazione... ⏳";
                detailDelete.disabled = true;

                try {
                    const payload = { action: 'delete', data: item.data };
                    const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        allData = allData.filter(d => d.data !== item.data);
                        aggiornaDashboardNumeri();
                        renderGrafico();
                        renderListaSpese();
                        detailModal.classList.remove('visible');
                        setTimeout(() => detailModal.classList.add('hidden'), 300);
                    } else {
                        alert("Errore dal Cloud: " + result.message);
                    }
                } catch (error) {
                    allData = allData.filter(d => d.data !== item.data);
                    aggiornaDashboardNumeri(); renderGrafico(); renderListaSpese();
                    detailModal.classList.remove('visible');
                    setTimeout(() => detailModal.classList.add('hidden'), 300);
                } finally {
                    detailDelete.textContent = "Elimina Spesa";
                    detailDelete.disabled = false;
                }
            });
        };
    }

    detailClose.addEventListener('click', () => {
        detailModal.classList.remove('visible');
        setTimeout(() => detailModal.classList.add('hidden'), 300);
    });

    filterText.addEventListener('input', renderListaSpese);
    sortOrder.addEventListener('change', renderListaSpese);

    fetchStorico();
});