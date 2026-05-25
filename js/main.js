// js/main.js
import { ottieniSpesa, aggiungiItem, toggleCompletato, svuotaLista, rimuoviItem } from './storage.js';
import { renderLista, getIconForWord, renderSuggerimenti } from './ui.js';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiCBpVCsyXBiTh-B-4tdfQmDPWVFg2J5f860gL5ogiXGHyURpnoKPuHVMB-SGmYxbE/exec';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearBtn = document.getElementById('clear-completed-btn');
    const micBtn = document.getElementById('mic-btn');
    const suggestionsContainer = document.getElementById('quick-suggestions');

    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCancel = document.getElementById('checkout-cancel');
    const checkoutConfirm = document.getElementById('checkout-confirm');
    const receiptTotal = document.getElementById('receipt-total');
    const supermarketSelect = document.getElementById('supermarket-select');

    const toastElement = document.getElementById('undo-toast');
    const toastUndoBtn = document.getElementById('toast-undo-btn');
    let toastTimer; 
    let lastDeletedItem = null; 

    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    const goToHistoryBtn = document.getElementById('go-to-history-btn');
    if (goToHistoryBtn) goToHistoryBtn.addEventListener('click', () => window.location.href = 'storico.html');

    function mostraModale(titolo, messaggio, onConfirm, isAlert = false) {
        modalTitle.textContent = titolo;
        modalMessage.textContent = messaggio;

        const oldCancelBtn = document.getElementById('modal-cancel');
        const oldConfirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = oldCancelBtn.cloneNode(true);
        const confirmBtn = oldConfirmBtn.cloneNode(true);
        oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);
        oldConfirmBtn.parentNode.replaceChild(confirmBtn, oldConfirmBtn);

        if (isAlert) {
            cancelBtn.classList.add('hidden');
            confirmBtn.textContent = 'OK';
            confirmBtn.classList.remove('danger-btn');
            confirmBtn.classList.add('secondary-btn');
        } else {
            cancelBtn.classList.remove('hidden');
            confirmBtn.textContent = 'Conferma';
            confirmBtn.classList.add('danger-btn');
            confirmBtn.classList.remove('secondary-btn');
        }

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

    function mostraToast(item) {
        lastDeletedItem = item; 
        toastElement.classList.remove('hidden');
        setTimeout(() => toastElement.classList.add('visible'), 10);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => nascondiToast(), 4000);
    }

    function nascondiToast() {
        toastElement.classList.remove('visible');
        setTimeout(() => toastElement.classList.add('hidden'), 400);
        lastDeletedItem = null;
    }

    toastUndoBtn.addEventListener('click', () => {
        if (lastDeletedItem) {
            const lista = ottieniSpesa();
            lista.push(lastDeletedItem);
            localStorage.setItem('spesa_mamma_data', JSON.stringify(lista));
            aggiornaSchermo();
            nascondiToast();
        }
    });

    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        renderLista(listaAttuale, listContainer, handleToggle, handleLongPress);
    };

    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    const handleLongPress = (item) => {
        rimuoviItem(item.id); 
        aggiornaSchermo();    
        mostraToast(item);    
    };

    const gestisciAggiunta = (testoDaAggiungere = null) => {
        const testo = (typeof testoDaAggiungere === 'string') ? testoDaAggiungere : inputField.value.trim();
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; 
            aggiornaSchermo();
            if (window.innerWidth > 768 && typeof testoDaAggiungere !== 'string') inputField.focus(); 
        }
    };

    renderSuggerimenti(suggestionsContainer, gestisciAggiunta);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micBtn.addEventListener('click', () => recognition.start());
        recognition.addEventListener('audiostart', () => { micBtn.classList.add('listening'); inputField.placeholder = "Ti ascolto..."; });
        recognition.addEventListener('result', (e) => { inputField.value = e.results[0][0].transcript; gestisciAggiunta(); });
        recognition.addEventListener('audioend', () => { micBtn.classList.remove('listening'); inputField.placeholder = "Es. 3 Latte, 2kg Mele..."; });
        recognition.addEventListener('error', (e) => { micBtn.classList.remove('listening'); inputField.placeholder = "Es. 3 Latte..."; if (e.error === 'not-allowed') mostraModale("Microfono bloccato", "Devi consentire l'uso del microfono.", null, true); });
    } else {
        micBtn.style.display = 'none';
    }

    checkoutBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            mostraModale("Lista Vuota", "Aggiungi almeno un prodotto prima di fare checkout!", null, true);
            return;
        }
        receiptTotal.value = '';
        supermarketSelect.value = 'Ignoto';
        checkoutModal.classList.remove('hidden');
        setTimeout(() => checkoutModal.classList.add('visible'), 10);
    });

    checkoutCancel.addEventListener('click', () => {
        checkoutModal.classList.remove('visible');
        setTimeout(() => checkoutModal.classList.add('hidden'), 300);
    });

    checkoutConfirm.addEventListener('click', () => {
        const totale = parseFloat(receiptTotal.value);
        if (isNaN(totale) || totale <= 0) {
            alert("Inserisci un totale valido.");
            return;
        }

        checkoutConfirm.textContent = "Salvataggio... ⏳";
        checkoutConfirm.disabled = true;

        // Estrae i nomi degli articoli attualmente in lista
        const lista = ottieniSpesa();
        const listaArticoli = lista.map(item => item.testo).join(', ');

        const payload = {
            data: new Date().toLocaleString("it-IT"),
            supermercato: supermarketSelect.value,
            totale: totale,
            articoli: listaArticoli // Salviamo la lista nel foglio Google!
        };

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                checkoutModal.classList.remove('visible');
                setTimeout(() => checkoutModal.classList.add('hidden'), 300);
                svuotaLista();
                aggiornaSchermo();
                mostraModale("Checkout Completato", "Dati salvati nel Cloud con successo! Lista svuotata.", null, true);
            } else {
                alert("Errore nel salvataggio: " + result.message);
            }
        })
        .catch(err => {
            checkoutModal.classList.remove('visible');
            setTimeout(() => checkoutModal.classList.add('hidden'), 300);
            svuotaLista();
            aggiornaSchermo();
            mostraModale("Checkout Inviato", "Spesa inviata. Controlla lo Storico per verificare.", null, true);
            console.error(err);
        })
        .finally(() => {
            checkoutConfirm.textContent = "Salva nel Cloud";
            checkoutConfirm.disabled = false;
        });
    });

    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) { mostraModale("Lista Vuota", "Non c'è nulla da inviare.", null, true); return; }
        let messaggio = "*SP€SA! 🛒*\n_Ecco la lista aggiornata:_\n\n";
        const listaOrdinata = [...lista].sort((a, b) => {
            if (a.completato !== b.completato) return a.completato ? 1 : -1;
            return a.testo.localeCompare(b.testo);
        });
        listaOrdinata.forEach(item => {
            const icona = getIconForWord(item.testo);
            const stato = item.completato ? "✅ " : "⬜ "; 
            messaggio += `${stato}${icona} *${item.testo}*\n`;
        });
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(messaggio)}`, '_blank');
    };

    addBtn.addEventListener('click', () => gestisciAggiunta());
    inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') gestisciAggiunta(); });
    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    clearBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) { mostraModale("Lista Vuota", "La lista è già vuota!", null, true); return; }
        mostraModale("Svuota Carrello", "Sei sicura di voler cancellare l'intera lista della spesa?", () => {
            svuotaLista();
            aggiornaSchermo();
        });
    });

    aggiornaSchermo();
});