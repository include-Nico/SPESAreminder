// js/main.js
import { ottieniSpesa, aggiungiItem, toggleCompletato, svuotaLista, rimuoviItem } from './storage.js';
import { renderLista, getIconForWord, renderSuggerimenti } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referenze Elementi DOM
    const inputField = document.getElementById('item-input');
    const addBtn = document.getElementById('add-btn');
    const listContainer = document.getElementById('shopping-list');
    const whatsappBtn = document.getElementById('share-whatsapp-btn');
    const clearBtn = document.getElementById('clear-completed-btn');
    const micBtn = document.getElementById('mic-btn');
    const suggestionsContainer = document.getElementById('quick-suggestions');

    // Referenze Toast di Annullamento Rapido
    const toastElement = document.getElementById('undo-toast');
    const toastUndoBtn = document.getElementById('toast-undo-btn');
    let toastTimer; // Timer per far sparire il toast
    let lastDeletedItem = null; // Memoria temporanea dell'oggetto cancellato

    // Referenze Modale Personalizzato
    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    // --- FUNZIONI DI SUPPORTO ---

    // Gestione Modale (Usato solo per grandi avvisi come "Svuota Tutto" o errori)
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
            confirmBtn.textContent = 'Elimina';
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

    // Gestione Toast (Avviso a scomparsa per l'eliminazione rapida)
    function mostraToast(item) {
        lastDeletedItem = item; // Salva l'oggetto appena eliminato
        
        // Mostra il toast con animazione a molla
        toastElement.classList.remove('hidden');
        setTimeout(() => toastElement.classList.add('visible'), 10);

        // Se c'era già un toast aperto, resetta il timer
        clearTimeout(toastTimer);
        
        // Nasconde automaticamente il toast dopo 4 secondi
        toastTimer = setTimeout(() => {
            nascondiToast();
        }, 4000);
    }

    function nascondiToast() {
        toastElement.classList.remove('visible');
        setTimeout(() => toastElement.classList.add('hidden'), 400);
        lastDeletedItem = null;
    }

    // Tasto "ANNULLA" sul Toast
    toastUndoBtn.addEventListener('click', () => {
        if (lastDeletedItem) {
            // Re-inserisce l'oggetto esattamente com'era (mantenendo lo stato completato)
            const lista = ottieniSpesa();
            lista.push(lastDeletedItem);
            localStorage.setItem('spesa_mamma_data', JSON.stringify(lista));
            
            aggiornaSchermo();
            nascondiToast();
        }
    });

    // --- FUNZIONI PRINCIPALI DELL'APP ---

    const aggiornaSchermo = () => {
        const listaAttuale = ottieniSpesa();
        // Disegna la lista attivando l'Intelligenza di Ordinamento!
        renderLista(listaAttuale, listContainer, handleToggle, handleLongPress);
    };

    const handleToggle = (id) => {
        toggleCompletato(id);
        aggiornaSchermo();
    };

    // ELIMINAZIONE RAPIDA: Dito premuto a lungo
    const handleLongPress = (item) => {
        rimuoviItem(item.id); // Elimina subito
        aggiornaSchermo();    // Ricarica la grafica
        mostraToast(item);    // Fa comparire il Toast di salvataggio!
    };

    const gestisciAggiunta = (testoDaAggiungere = null) => {
        // Se riceve un testo diretto (es. dai Suggerimenti Rapidi) usa quello
        const testo = (typeof testoDaAggiungere === 'string') ? testoDaAggiungere : inputField.value.trim();
        
        if (testo !== '') {
            aggiungiItem(testo);
            inputField.value = ''; 
            aggiornaSchermo();
            // Focus solo se è su schermi grandi
            if (window.innerWidth > 768 && typeof testoDaAggiungere !== 'string') inputField.focus(); 
        }
    };

    // Genera i bottoni dei Suggerimenti Rapidi
    renderSuggerimenti(suggestionsContainer, gestisciAggiunta);

    // --- MICROFONO ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        micBtn.addEventListener('click', () => recognition.start());

        recognition.addEventListener('audiostart', () => {
            micBtn.classList.add('listening');
            inputField.placeholder = "Ti ascolto...";
        });

        recognition.addEventListener('result', (e) => {
            inputField.value = e.results[0][0].transcript;
            gestisciAggiunta(); 
        });

        recognition.addEventListener('audioend', () => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte, 2kg Mele...";
        });

        recognition.addEventListener('error', (e) => {
            micBtn.classList.remove('listening');
            inputField.placeholder = "Es. 3 Latte...";
            if (e.error === 'not-allowed') {
                mostraModale("Microfono bloccato", "Devi consentire l'uso del microfono nelle impostazioni.", null, true);
            }
        });
    } else {
        micBtn.style.display = 'none';
    }

    // --- WHATSAPP ---
    const gestisciCondivisioneWhatsApp = () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            mostraModale("Lista Vuota", "Non c'è nulla da inviare. Aggiungi qualcosa prima!", null, true);
            return;
        }

        let messaggio = "*SP€SA! 🛒*\n_Ecco la lista aggiornata:_\n\n";
        
        // Ordiniamo la lista anche per WhatsApp, così arriva divisa per reparti!
        const listaOrdinata = [...lista].sort((a, b) => {
            if (a.completato !== b.completato) return a.completato ? 1 : -1;
            return a.testo.localeCompare(b.testo);
        });

        listaOrdinata.forEach(item => {
            const icona = getIconForWord(item.testo);
            const stato = item.completato ? "✅ " : "⬜ "; 
            messaggio += `${stato}${icona} *${item.testo}*\n`;
        });

        const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(messaggio)}`;
        window.open(urlWhatsApp, '_blank');
    };

    // --- EVENT LISTENERS AGGIUNTIVI ---
    addBtn.addEventListener('click', () => gestisciAggiunta());
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gestisciAggiunta();
    });

    whatsappBtn.addEventListener('click', gestisciCondivisioneWhatsApp);
    
    clearBtn.addEventListener('click', () => {
        const lista = ottieniSpesa();
        if (lista.length === 0) {
            mostraModale("Lista Vuota", "La lista è già vuota!", null, true);
            return; 
        }

        mostraModale(
            "Svuota Carrello", 
            "Sei sicura di voler cancellare l'intera lista della spesa?", 
            () => {
                svuotaLista();
                aggiornaSchermo();
            }
        );
    });

    // Avvio dell'app al caricamento
    aggiornaSchermo();
});